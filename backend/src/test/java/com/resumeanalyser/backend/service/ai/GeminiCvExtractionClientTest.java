package com.resumeanalyser.backend.service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import com.resumeanalyser.backend.config.GeminiProperties;
import com.resumeanalyser.backend.dto.ai.CvExtractionResult;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class GeminiCvExtractionClientTest {

    private ObjectMapper objectMapper;
    private GeminiCvExtractionClient client;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        GeminiProperties properties = properties("test-key");
        client = new GeminiCvExtractionClient(
                properties,
                objectMapper,
                new CvExtractionContract(objectMapper),
                HttpClient.newHttpClient());
    }

    @Test
    void requestContainsPdfSystemPromptAndResponseSchema() throws Exception {
        byte[] pdf = "%PDF-1.4 test".getBytes();

        JsonNode request = objectMapper.readTree(client.buildRequestBody(pdf));

        assertTrue(request.path("systemInstruction").path("parts").path(0).path("text")
                .asText().contains("untrusted data"));
        JsonNode inlineData = request.path("contents").path(0).path("parts").path(0).path("inlineData");
        assertEquals("application/pdf", inlineData.path("mimeType").asText());
        assertTrue(!inlineData.path("data").asText().isBlank());
        assertEquals("application/json",
                request.path("generationConfig").path("responseMimeType").asText());
        assertEquals(4, request.path("generationConfig").path("responseJsonSchema")
                .path("properties").size());
        assertTrue(!client.buildRequestBody(pdf).contains("maxItems"));
        assertTrue(!client.buildRequestBody(pdf).contains("additionalProperties"));
    }

    @Test
    void parsesStructuredGeminiResponse() {
        String extractedJson = """
                {"skills":[{"name":"Java","category":"Backend"}],
                 "experience":[],"education":[],"certificates":[]}
                """;
        String response = """
                {"candidates":[{"content":{"parts":[{"text":%s}]}}]}
                """.formatted(objectMapper.writeValueAsString(extractedJson));

        CvExtractionResult result = client.parseResponse(response);

        assertEquals("Java", result.skills().getFirst().name());
        assertTrue(result.experience().isEmpty());
    }

    @Test
    void rejectsInvalidPdfBeforeCallingGemini() {
        assertThrows(IllegalArgumentException.class,
                () -> client.extract("not-a-pdf".getBytes()));
    }

    @Test
    void rejectsResponseWithoutCandidate() {
        GeminiRequestException error = assertThrows(GeminiRequestException.class,
                () -> client.parseResponse("{\"promptFeedback\":{\"blockReason\":\"SAFETY\"}}"));
        assertEquals(502, error.getStatusCode());
        assertTrue(error.getMessage().contains("SAFETY"));
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "RUN_GEMINI_CV_LIVE_TEST", matches = "(?i)true")
    @EnabledIfEnvironmentVariable(named = "GEMINI_API_KEY", matches = ".+")
    @EnabledIfEnvironmentVariable(named = "GEMINI_TEST_PDF_PATH", matches = ".+")
    void extractsARealPdfWithGemini() {
        GeminiProperties liveProperties = properties(System.getenv("GEMINI_API_KEY"));
        String configuredModel = System.getenv("GEMINI_MODEL");
        if (configuredModel != null && !configuredModel.isBlank()) {
            liveProperties.setModel(configuredModel);
        }
        GeminiCvExtractionClient liveClient = new GeminiCvExtractionClient(
                liveProperties,
                objectMapper,
                new CvExtractionContract(objectMapper),
                HttpClient.newBuilder().connectTimeout(liveProperties.getTimeout()).build());

        CvExtractionResult result = liveClient.extract(Path.of(System.getenv("GEMINI_TEST_PDF_PATH")));

        assertTrue(result.skills() != null && result.experience() != null
                && result.education() != null && result.certificates() != null);
    }

    private GeminiProperties properties(String apiKey) {
        GeminiProperties properties = new GeminiProperties();
        properties.setApiKey(apiKey);
        properties.setModel("gemini-3.5-flash-lite");
        properties.setBaseUrl(URI.create("https://generativelanguage.googleapis.com/v1beta/"));
        return properties;
    }
}
