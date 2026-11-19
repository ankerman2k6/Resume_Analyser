package com.resumeanalyser.backend.service.ai;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class CvExtractionContract {

    private static final String SCHEMA_PATH = "ai/cv-extraction-schema.json";
    private static final String PROMPT_PATH = "ai/cv-extraction-system-prompt.txt";

    private final JsonNode schema;
    private final String systemPrompt;

    public CvExtractionContract(ObjectMapper objectMapper) {
        this.schema = loadSchema(objectMapper);
        this.systemPrompt = loadText(PROMPT_PATH);
    }

    public JsonNode schema() {
        return schema.deepCopy();
    }

    public String systemPrompt() {
        return systemPrompt;
    }

    private static JsonNode loadSchema(ObjectMapper objectMapper) {
        try (InputStream input = new ClassPathResource(SCHEMA_PATH).getInputStream()) {
            return objectMapper.readTree(input);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể tải JSON Schema trích xuất CV.", exception);
        }
    }

    private static String loadText(String path) {
        try (InputStream input = new ClassPathResource(path).getInputStream()) {
            return new String(input.readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể tải system prompt trích xuất CV.", exception);
        }
    }
}
