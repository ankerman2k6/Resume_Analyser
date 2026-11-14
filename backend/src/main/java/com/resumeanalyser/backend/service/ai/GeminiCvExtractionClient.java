package com.resumeanalyser.backend.service.ai;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.config.GeminiProperties;
import com.resumeanalyser.backend.dto.ai.CvExtractionResult;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

@Service
public class GeminiCvExtractionClient {

    static final long MAX_INLINE_PDF_BYTES = 5L * 1024 * 1024;
    private static final int MAX_ATTEMPTS = 3;

    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;
    private final CvExtractionContract contract;
    private final HttpClient httpClient;

    @Autowired
    public GeminiCvExtractionClient(
            GeminiProperties properties,
            ObjectMapper objectMapper,
            CvExtractionContract contract) {
        this(properties, objectMapper, contract, HttpClient.newBuilder()
                .connectTimeout(properties.getTimeout())
                .build());
    }

    GeminiCvExtractionClient(
            GeminiProperties properties,
            ObjectMapper objectMapper,
            CvExtractionContract contract,
            HttpClient httpClient) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.contract = contract;
        this.httpClient = httpClient;
    }

    public CvExtractionResult extract(Path pdfPath) {
        if (pdfPath == null || !Files.isRegularFile(pdfPath)) {
            throw new IllegalArgumentException("Không tìm thấy file PDF cần phân tích.");
        }
        try {
            long size = Files.size(pdfPath);
            if (size > MAX_INLINE_PDF_BYTES) {
                throw new IllegalArgumentException("File PDF không được vượt quá 5 MB.");
            }
            return extract(Files.readAllBytes(pdfPath));
        } catch (IOException exception) {
            throw new GeminiRequestException("Không thể đọc file PDF để gửi Gemini.", 0, exception);
        }
    }

    public CvExtractionResult extract(byte[] pdfBytes) {
        validateConfiguration();
        validatePdf(pdfBytes);

        HttpRequest request = HttpRequest.newBuilder(endpoint())
                .timeout(properties.getTimeout())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("x-goog-api-key", properties.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(
                        buildRequestBody(pdfBytes), StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = sendWithRetry(request);
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new GeminiRequestException(
                    "Gemini trả HTTP " + response.statusCode() + ": " + safeBody(response.body()),
                    response.statusCode());
        }
        return parseResponse(response.body());
    }

    String buildRequestBody(byte[] pdfBytes) {
        ObjectNode root = objectMapper.createObjectNode();

        ObjectNode systemInstruction = root.putObject("systemInstruction");
        systemInstruction.putArray("parts").addObject().put("text", contract.systemPrompt());

        ArrayNode contents = root.putArray("contents");
        ObjectNode userContent = contents.addObject();
        userContent.put("role", "user");
        ArrayNode parts = userContent.putArray("parts");
        ObjectNode inlineData = parts.addObject().putObject("inlineData");
        inlineData.put("mimeType", "application/pdf");
        inlineData.put("data", Base64.getEncoder().encodeToString(pdfBytes));
        parts.addObject().put("text",
                "Extract the candidate's career data from this CV according to the response schema.");

        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.set("responseJsonSchema", contract.schema());

        return objectMapper.writeValueAsString(root);
    }

    CvExtractionResult parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                String blockReason = root.path("promptFeedback").path("blockReason").asText("");
                String detail = blockReason.isBlank() ? "không có candidate" : "bị chặn: " + blockReason;
                throw new GeminiRequestException("Gemini không trả kết quả CV: " + detail + ".", 502);
            }

            StringBuilder json = new StringBuilder();
            candidates.path(0).path("content").path("parts")
                    .forEach(part -> {
                        if (part.has("text")) {
                            json.append(part.path("text").asText());
                        }
                    });
            if (json.isEmpty()) {
                throw new GeminiRequestException("Gemini không trả JSON trích xuất CV.", 502);
            }

            CvExtractionResult result = objectMapper.readValue(json.toString(), CvExtractionResult.class);
            validateResult(result);
            return result;
        } catch (GeminiRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new GeminiRequestException("JSON trích xuất CV từ Gemini không hợp lệ.", 502, exception);
        }
    }

    private HttpResponse<String> sendWithRetry(HttpRequest request) {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                HttpResponse<String> response = httpClient.send(
                        request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
                if (!isRetryable(response.statusCode()) || attempt == MAX_ATTEMPTS) {
                    return response;
                }
                pauseBeforeRetry(attempt);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new GeminiRequestException("Yêu cầu Gemini bị gián đoạn.", 0, exception);
            } catch (IOException exception) {
                if (attempt == MAX_ATTEMPTS) {
                    throw new GeminiRequestException("Không thể kết nối tới Gemini API.", 0, exception);
                }
                pauseBeforeRetry(attempt);
            }
        }
        throw new IllegalStateException("Luồng retry Gemini kết thúc ngoài dự kiến.");
    }

    private void pauseBeforeRetry(int attempt) {
        try {
            Thread.sleep(500L * attempt);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new GeminiRequestException("Yêu cầu Gemini bị gián đoạn.", 0, exception);
        }
    }

    private boolean isRetryable(int statusCode) {
        return statusCode == 429 || statusCode == 503;
    }

    private void validateConfiguration() {
        if (!properties.isConfigured()) {
            throw new IllegalStateException(
                    "Gemini chưa được cấu hình. Hãy đặt biến môi trường GEMINI_API_KEY.");
        }
    }

    private void validatePdf(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length < 5) {
            throw new IllegalArgumentException("File PDF trống hoặc không hợp lệ.");
        }
        if (pdfBytes.length > MAX_INLINE_PDF_BYTES) {
            throw new IllegalArgumentException("File PDF không được vượt quá 5 MB.");
        }
        if (pdfBytes[0] != '%' || pdfBytes[1] != 'P' || pdfBytes[2] != 'D'
                || pdfBytes[3] != 'F' || pdfBytes[4] != '-') {
            throw new IllegalArgumentException("File gửi Gemini không phải PDF hợp lệ.");
        }
    }

    private void validateResult(CvExtractionResult result) {
        if (result == null || result.skills() == null || result.experience() == null
                || result.education() == null || result.certificates() == null) {
            throw new GeminiRequestException("Gemini trả thiếu nhóm dữ liệu CV bắt buộc.", 502);
        }
    }

    private URI endpoint() {
        String encodedModel = URLEncoder.encode(properties.getModel(), StandardCharsets.UTF_8);
        return properties.getBaseUrl().resolve("models/" + encodedModel + ":generateContent");
    }

    private String safeBody(String body) {
        if (body == null || body.isBlank()) {
            return "không có nội dung lỗi";
        }
        String normalized = body.replaceAll("[\\r\\n]+", " ").trim();
        return normalized.length() <= 500 ? normalized : normalized.substring(0, 500) + "…";
    }
}
