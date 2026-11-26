package com.resumeanalyser.backend.service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import com.resumeanalyser.backend.config.GeminiProperties;

import tools.jackson.databind.ObjectMapper;

class GeminiSmokeClientTest {

    @Test
    void rejectsCallsWhenApiKeyIsMissing() {
        GeminiProperties properties = properties("");
        GeminiSmokeClient client = new GeminiSmokeClient(properties, new ObjectMapper());

        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> client.generateText("ping"));

        assertTrue(error.getMessage().contains("GEMINI_API_KEY"));
    }

    @Test
    void extractsTextFromGeminiResponse() throws Exception {
        GeminiSmokeClient client = new GeminiSmokeClient(properties("test-key"), new ObjectMapper());

        String text = client.extractText("""
                {
                  "candidates": [
                    {"content": {"parts": [{"text": "KONEK_GEMINI_OK"}]}}
                  ]
                }
                """);

        assertEquals("KONEK_GEMINI_OK", text);
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "RUN_GEMINI_LIVE_TEST", matches = "(?i)true")
    @EnabledIfEnvironmentVariable(named = "GEMINI_API_KEY", matches = ".+")
    void configuredFreeTierKeyCanReachGemini() {
        GeminiProperties properties = properties(System.getenv("GEMINI_API_KEY"));
        String configuredModel = System.getenv("GEMINI_MODEL");
        if (configuredModel != null && !configuredModel.isBlank()) {
            properties.setModel(configuredModel);
        }

        GeminiSmokeClient client = new GeminiSmokeClient(properties, new ObjectMapper());
        String response = client.generateText(
                "Return exactly this text and nothing else: KONEK_GEMINI_OK");

        assertTrue(response.contains("KONEK_GEMINI_OK"),
                () -> "Gemini đã phản hồi nhưng không đúng marker: " + response);
    }

    private GeminiProperties properties(String apiKey) {
        GeminiProperties properties = new GeminiProperties();
        properties.setApiKey(apiKey);
        properties.setModel("gemini-3.5-flash-lite");
        properties.setBaseUrl(URI.create("https://generativelanguage.googleapis.com/v1beta/"));
        return properties;
    }
}
