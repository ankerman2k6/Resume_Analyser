package com.resumeanalyser.backend.service.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.resumeanalyser.backend.dto.ai.CvExtractionResult;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.model.Cv;
import com.resumeanalyser.backend.repository.CvRepository;

@ExtendWith(MockitoExtension.class)
class CvParsingServiceTest {

    @Mock
    private CvRepository cvRepository;
    @Mock
    private MongoTemplate mongoTemplate;
    @Mock
    private GeminiCvExtractionClient geminiClient;

    @TempDir
    Path tempDir;

    private CvParsingService service;
    private ObjectId cvId;
    private ObjectId candidateId;
    private Cv cv;

    @BeforeEach
    void setUp() throws Exception {
        service = new CvParsingService(
                cvRepository, mongoTemplate, geminiClient, new CvExtractionMapper());
        cvId = new ObjectId();
        candidateId = new ObjectId();
        Path pdf = tempDir.resolve("cv.pdf");
        Files.writeString(pdf, "%PDF-1.4 test");

        cv = new Cv();
        cv.setId(cvId);
        cv.setCandidateId(candidateId);
        cv.setSource(new Cv.Source("uploaded", "cv.pdf", pdf.toString(), "application/pdf"));
    }

    @Test
    void extractsAndAtomicallyUpdatesOnlyOwnedCv() {
        CvExtractionResult result = new CvExtractionResult(
                List.of(new CvExtractionResult.Skill("Java", "Backend", null, 3)),
                List.of(), List.of(), List.of());
        Cv updated = new Cv();
        updated.setId(cvId);
        updated.setCandidateId(candidateId);
        updated.setSkills(List.of(new Cv.Skill("Java", "Backend", null, 3)));
        updated.setParseInfo(new Cv.ParseInfo("completed", java.time.Instant.now(), "gemini-cv-v1"));

        when(cvRepository.findByIdAndCandidateId(cvId, candidateId)).thenReturn(Optional.of(cv));
        when(mongoTemplate.findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(Cv.class)))
                .thenReturn(cv)
                .thenReturn(updated);
        when(geminiClient.extract(any(Path.class))).thenReturn(result);

        Cv saved = service.parseAndSave(cvId, candidateId);

        assertEquals("completed", saved.getParseInfo().getStatus());
        assertEquals("Java", saved.getSkills().getFirst().getName());
        ArgumentCaptor<Update> updates = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate, org.mockito.Mockito.times(2)).findAndModify(
                any(Query.class), updates.capture(), any(FindAndModifyOptions.class), eq(Cv.class));
        Document finalSet = (Document) updates.getAllValues().get(1).getUpdateObject().get("$set");
        assertEquals("completed", ((Cv.ParseInfo) finalSet.get("parseInfo")).getStatus());
        assertEquals(1, ((List<?>) finalSet.get("skills")).size());
    }

    @Test
    void marksCvFailedWhenGeminiFails() {
        GeminiRequestException failure = new GeminiRequestException("Gemini unavailable", 503);
        when(cvRepository.findByIdAndCandidateId(cvId, candidateId)).thenReturn(Optional.of(cv));
        when(mongoTemplate.findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(Cv.class)))
                .thenReturn(cv);
        when(geminiClient.extract(any(Path.class))).thenThrow(failure);

        assertEquals(failure, assertThrows(GeminiRequestException.class,
                () -> service.parseAndSave(cvId, candidateId)));

        ArgumentCaptor<Update> failedUpdate = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).updateFirst(any(Query.class), failedUpdate.capture(), eq(Cv.class));
        Document set = (Document) failedUpdate.getValue().getUpdateObject().get("$set");
        assertEquals("failed", ((Cv.ParseInfo) set.get("parseInfo")).getStatus());
    }

    @Test
    void rejectsCvNotOwnedByCandidateBeforeCallingGemini() {
        when(cvRepository.findByIdAndCandidateId(cvId, candidateId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.parseAndSave(cvId, candidateId));

        verify(geminiClient, never()).extract(any(Path.class));
        verify(mongoTemplate, never()).findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(Cv.class));
    }

    @Test
    void rejectsASecondParseWhileFirstParseIsProcessing() {
        when(cvRepository.findByIdAndCandidateId(cvId, candidateId)).thenReturn(Optional.of(cv));
        when(mongoTemplate.findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(Cv.class)))
                .thenReturn(null);

        ConflictException error = assertThrows(ConflictException.class,
                () -> service.parseAndSave(cvId, candidateId));

        assertEquals("CV_PARSE_IN_PROGRESS", error.getCode());
        verify(geminiClient, never()).extract(any(Path.class));
    }
}
