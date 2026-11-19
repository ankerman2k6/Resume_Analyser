package com.resumeanalyser.backend.service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.resumeanalyser.backend.dto.ai.CvExtractionResult;
import com.resumeanalyser.backend.service.ai.CvExtractionMapper.NormalizedCvData;

class CvExtractionMapperTest {

    private final CvExtractionMapper mapper = new CvExtractionMapper();

    @Test
    void normalizesDeduplicatesAndMapsEveryMongoCareerGroup() {
        CvExtractionResult source = new CvExtractionResult(
                List.of(
                        new CvExtractionResult.Skill(" Java ", " Backend ", null, 3),
                        new CvExtractionResult.Skill("java", "Other", "Advanced", 4),
                        new CvExtractionResult.Skill(" ", "Ignored", null, null)),
                List.of(new CvExtractionResult.Experience(
                        " Developer ", " ACME  Corp ", " Hanoi ", " Full-time ",
                        "2022", null, true, " Built APIs ",
                        List.of(" Improved latency ", "improved latency"),
                        List.of(" Java ", "Spring"))),
                List.of(new CvExtractionResult.Education(
                        " Bachelor ", " Computer Science ", " Test University ",
                        "2018", "2022", "Graduated", new CvExtractionResult.Gpa(3.5, 4), null)),
                List.of(new CvExtractionResult.Certificate(
                        " AWS ", " Amazon ", "2023", "ABC", null, null)));

        NormalizedCvData data = mapper.normalize(source);

        assertEquals(1, data.skills().size());
        assertEquals("Java", data.skills().getFirst().getName());
        assertEquals("ACME Corp", data.experience().getFirst().getCompany());
        assertEquals(List.of("Improved latency"), data.experience().getFirst().getAchievements());
        assertEquals(3.5, data.education().getFirst().getGpa().getValue());
        assertNull(data.education().getFirst().getDescription());
        assertEquals("AWS", data.certificates().getFirst().getName());
    }

    @Test
    void discardsSemanticallyEmptyItemsAndInvalidGpa() {
        CvExtractionResult source = new CvExtractionResult(
                List.of(),
                List.of(new CvExtractionResult.Experience(
                        "", "", "", "", "", null, false, "", List.of(), List.of())),
                List.of(new CvExtractionResult.Education(
                        "Degree", "", "School", "", "", "", new CvExtractionResult.Gpa(11, 10), null)),
                List.of(new CvExtractionResult.Certificate("", "Issuer", "2024", "", null, null)));

        NormalizedCvData data = mapper.normalize(source);

        assertEquals(0, data.experience().size());
        assertNull(data.education().getFirst().getGpa());
        assertEquals(0, data.certificates().size());
    }
}
