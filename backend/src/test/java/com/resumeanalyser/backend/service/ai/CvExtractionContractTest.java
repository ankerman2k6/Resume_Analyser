package com.resumeanalyser.backend.service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.resumeanalyser.backend.dto.ai.CvExtractionResult;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class CvExtractionContractTest {

    private ObjectMapper objectMapper;
    private CvExtractionContract contract;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        contract = new CvExtractionContract(objectMapper);
    }

    @Test
    void exposesOnlyTheFourCareerGroups() {
        assertEquals(
                Set.of("skills", "experience", "education", "certificates"),
                fieldNames(contract.schema().path("properties")));
    }

    @Test
    void requiredNestedFieldsMatchMongoValidator() {
        JsonNode properties = contract.schema().path("properties");

        assertEquals(Set.of("name", "category"), required(properties, "skills"));
        assertEquals(Set.of(
                "position", "company", "location", "employmentType", "startDate",
                "current", "description", "achievements", "technologies"),
                required(properties, "experience"));
        assertEquals(Set.of("degree", "major", "institution", "startDate", "endDate", "status"),
                required(properties, "education"));
        assertEquals(Set.of("name", "issuer", "issueDate", "credentialId"),
                required(properties, "certificates"));
    }

    @Test
    void structuredJsonDeserializesToTypedResult() throws Exception {
        CvExtractionResult result = objectMapper.readValue("""
                {
                  "skills": [{"name":"Java","category":"Backend"}],
                  "experience": [],
                  "education": [],
                  "certificates": []
                }
                """, CvExtractionResult.class);

        assertEquals("Java", result.skills().getFirst().name());
        assertNotNull(result.experience());
    }

    @Test
    void promptForbidsHallucinationAndPromptInjection() {
        String prompt = contract.systemPrompt().toLowerCase();
        assertTrue(prompt.contains("untrusted data"));
        assertTrue(prompt.contains("do not invent"));
        assertTrue(prompt.contains("do not infer skills"));
    }

    private Set<String> required(JsonNode properties, String group) {
        Set<String> names = new HashSet<>();
        properties.path(group).path("items").path("required")
                .forEach(node -> names.add(node.asText()));
        return names;
    }

    private Set<String> fieldNames(JsonNode node) {
        Set<String> names = new HashSet<>();
        names.addAll(node.propertyNames());
        return names;
    }
}
