package com.resumeanalyser.backend.service.ai;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.config.GeminiProperties;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Client tối thiểu dùng để xác nhận API key/model Gemini hoạt động.
 * Phần đọc PDF và structured output sẽ được xây ở các bước tiếp theo.
 */
@Service
public class GeminiSmokeClient {

    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Autowired
    public GeminiSmokeClient(GeminiProperties properties, ObjectMapper objectMapper) {
        this(properties, objectMapper, HttpClient.newBuilder()
                .connectTimeout(properties.getTimeout())
                .build());
    }

    GeminiSmokeClient(GeminiProperties properties, ObjectMapper objectMapper, HttpClient httpClient) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = httpClient;
    }

    public String generateText(String prompt) {
        if (!properties.isConfigured()) {
            throw new IllegalStateException(
                    "Gemini chưa được cấu hình. Hãy đặt biến môi trường GEMINI_API_KEY.");
        }
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt Gemini không được để trống.");
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", prompt))))));

            HttpRequest request = HttpRequest.newBuilder(endpoint())
                    .timeout(properties.getTimeout())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("x-goog-api-key", properties.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new GeminiRequestException(
                        "Gemini trả HTTP " + response.statusCode() + ": " + safeBody(response.body()),
                        response.statusCode());
            }

            return extractText(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new GeminiRequestException("Yêu cầu Gemini bị gián đoạn.", 0, exception);
        } catch (IOException exception) {
            throw new GeminiRequestException("Không thể kết nối tới Gemini API.", 0, exception);
        }
    }

    private URI endpoint() {
        String encodedModel = URLEncoder.encode(properties.getModel(), StandardCharsets.UTF_8);
        return properties.getBaseUrl().resolve("models/" + encodedModel + ":generateContent");
    }

    String extractText(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (text.isMissingNode() || text.isNull() || text.asText().isBlank()) {
            throw new GeminiRequestException("Gemini không trả về nội dung văn bản.", 502);
        }
        return text.asText().trim();
    }

    private String safeBody(String body) {
        if (body == null || body.isBlank()) {
            return "không có nội dung lỗi";
        }
        String normalized = body.replaceAll("[\\r\\n]+", " ").trim();
        return normalized.length() <= 500 ? normalized : normalized.substring(0, 500) + "…";
    }
}
