package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.mock.web.MockMultipartFile;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.candidate.CandidateApplicationDto;
import com.resumeanalyser.backend.dto.candidate.CareerDto;
import com.resumeanalyser.backend.dto.candidate.CvSummaryDto;
import com.resumeanalyser.backend.dto.candidate.ProfileDto;
import com.resumeanalyser.backend.dto.candidate.StatsDto;
import com.resumeanalyser.backend.dto.candidate.UpdateProfileRequest;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.exception.UnsupportedFileTypeException;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.CandidateProfile;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.Cv;
import com.resumeanalyser.backend.model.CvAnalysis;
import com.resumeanalyser.backend.model.Interview;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.ApplicationRepository;
import com.resumeanalyser.backend.repository.CandidateProfileRepository;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.CvAnalysisRepository;
import com.resumeanalyser.backend.repository.CvRepository;
import com.resumeanalyser.backend.repository.InterviewRepository;
import com.resumeanalyser.backend.repository.JobRepository;
import com.resumeanalyser.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTests {

    @Mock
    CandidateProfileRepository profileRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    CvRepository cvRepository;

    @Mock
    CvAnalysisRepository cvAnalysisRepository;

    @Mock
    CompanyRepository companyRepository;

    @Mock
    ApplicationRepository applicationRepository;

    @Mock
    InterviewRepository interviewRepository;

    @Mock
    JobRepository jobRepository;

    @Mock
    MongoTemplate mongoTemplate;

    @TempDir
    Path tempUploadDir;

    CandidateService candidateService;

    User activeCandidate;
    CandidateProfile existingProfile;
    ObjectId candidateProfileId;
    ObjectId userObjectId;

    @BeforeEach
    void setUp() {
        candidateService = new CandidateService(
                profileRepository,
                userRepository,
                cvRepository,
                cvAnalysisRepository,
                companyRepository,
                applicationRepository,
                interviewRepository,
                jobRepository,
                mongoTemplate,
                tempUploadDir.toString()
        );

        userObjectId = new ObjectId();
        candidateProfileId = new ObjectId();

        activeCandidate = new User();
        activeCandidate.setId(userObjectId.toHexString());
        activeCandidate.setEmail("candidate@test.com");
        activeCandidate.setRole("candidate");
        activeCandidate.setStatus("active");
        activeCandidate.setEmailVerified(true);

        existingProfile = new CandidateProfile();
        existingProfile.setId(candidateProfileId);
        existingProfile.setUserId(userObjectId);
        existingProfile.setFullName("Nguyen Van A");
        existingProfile.setPhone("0901234567");
        existingProfile.setAvatarUrl("");
        existingProfile.setLocation(new CandidateProfile.Location("Hanoi", "Vietnam"));
        existingProfile.setCreatedAt(Instant.now());
        existingProfile.setUpdatedAt(Instant.now());
    }

    @Test
    void verifyAccess_forbiddenForRecruiter() {
        User recruiter = new User();
        recruiter.setId(new ObjectId().toHexString());
        recruiter.setRole("recruiter");
        recruiter.setStatus("active");

        assertThrows(ForbiddenException.class, () -> candidateService.getProfile(recruiter));
    }

    @Test
    void getProfile_success() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));

        ProfileDto dto = candidateService.getProfile(activeCandidate);

        assertNotNull(dto);
        assertEquals("Nguyen Van A", dto.fullName());
        assertEquals("0901234567", dto.phone());
        assertEquals("candidate@test.com", dto.email());
        assertEquals("Hanoi", dto.location().city());
        assertEquals("Vietnam", dto.location().country());
        assertEquals("active", dto.accountStatus());
        assertTrue(dto.emailVerified());
    }

    @Test
    void getProfile_notFoundThrowsProfileNotFound() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> candidateService.getProfile(activeCandidate));
        assertEquals("PROFILE_NOT_FOUND", ex.getCode());
    }

    @Test
    void saveProfile_updateExisting() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));
        when(profileRepository.save(any(CandidateProfile.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest req = new UpdateProfileRequest(
                "Nguyen Van Updated",
                "0988888888",
                new UpdateProfileRequest.LocationInput("Da Nang", "Vietnam")
        );

        CandidateService.SaveResult result = candidateService.saveProfile(activeCandidate, req);

        assertFalse(result.created());
        assertEquals("Nguyen Van Updated", result.dto().fullName());
        assertEquals("0988888888", result.dto().phone());
        assertEquals("Da Nang", result.dto().location().city());
    }

    @Test
    void saveProfile_createNew() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.empty());
        when(profileRepository.save(any(CandidateProfile.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest req = new UpdateProfileRequest(
                "Nguyen Van New",
                "",
                new UpdateProfileRequest.LocationInput("Hue", "Vietnam")
        );

        CandidateService.SaveResult result = candidateService.saveProfile(activeCandidate, req);

        assertTrue(result.created());
        assertEquals("Nguyen Van New", result.dto().fullName());
        assertNull(result.dto().phone()); // Empty string mapped to null in DTO
        assertEquals("Hue", result.dto().location().city());
    }

    @Test
    void getStats_whenNoProfile() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.empty());

        StatsDto stats = candidateService.getStats(activeCandidate);

        assertEquals(0, stats.cvCount());
        assertEquals(0, stats.applicationCount());
        assertEquals(0, stats.upcomingInterviewCount());
        assertNull(stats.avgMatchScore());
        assertEquals(0, stats.analyzedApplicationCount());
        assertEquals(0, stats.applicationCounts().all());
    }

    @Test
    void getStats_withDataAndAvgScoreCalculation() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));
        when(cvRepository.countByCandidateId(candidateProfileId)).thenReturn(2L);

        Application app1 = new Application();
        app1.setId(new ObjectId());
        app1.setJobId(new ObjectId());
        app1.setCvId(new ObjectId());
        app1.setStatus("applied");

        Application app2 = new Application();
        app2.setId(new ObjectId());
        app2.setJobId(new ObjectId());
        app2.setCvId(new ObjectId());
        app2.setStatus("interview_scheduled");

        when(applicationRepository.findByCandidateId(candidateProfileId)).thenReturn(List.of(app1, app2));
        when(mongoTemplate.count(any(Query.class), eq(Interview.class))).thenReturn(1L);

        // Mock CV analyses for avgMatchScore
        CvAnalysis analysis1 = new CvAnalysis();
        analysis1.setScores(new CvAnalysis.Scores(80, 85, 75, 80, 80, 70));

        CvAnalysis analysis2 = new CvAnalysis();
        analysis2.setScores(new CvAnalysis.Scores(77, 80, 70, 80, 80, 70));

        when(mongoTemplate.findOne(any(Query.class), eq(CvAnalysis.class)))
                .thenReturn(analysis1)
                .thenReturn(analysis2);

        StatsDto stats = candidateService.getStats(activeCandidate);

        assertEquals(2, stats.cvCount());
        assertEquals(2, stats.applicationCount());
        assertEquals(1, stats.upcomingInterviewCount());
        assertEquals(78.5, stats.avgMatchScore()); // (80 + 77) / 2 = 78.5
        assertEquals(2, stats.analyzedApplicationCount());
        assertEquals(1, stats.applicationCounts().applied());
        assertEquals(1, stats.applicationCounts().interview());
    }

    @Test
    void getApplications_invalidFilterThrowsBadRequest() {
        assertThrows(BadRequestException.class, () ->
                candidateService.getApplications(activeCandidate, "invalid_filter", 0, 10));
    }

    @Test
    void withdrawApplication_alreadyWithdrawnIsIdempotent() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));

        ObjectId appId = new ObjectId();
        Application app = new Application();
        app.setId(appId);
        app.setCandidateId(candidateProfileId);
        app.setStatus("withdrawn");

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));

        CandidateApplicationDto dto = candidateService.withdrawApplication(activeCandidate, appId.toHexString());

        assertNotNull(dto);
        assertEquals("withdrawn", dto.status());
        assertFalse(dto.canWithdraw());
    }

    @Test
    void withdrawApplication_conflictWhenStatusNotApplied() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));

        ObjectId appId = new ObjectId();
        Application app = new Application();
        app.setId(appId);
        app.setCandidateId(candidateProfileId);
        app.setStatus("interview_scheduled");

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                candidateService.withdrawApplication(activeCandidate, appId.toHexString()));
        assertEquals("APPLICATION_NOT_WITHDRAWABLE", ex.getCode());
    }

    @Test
    void deleteCv_conflictWhenInUse() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));

        ObjectId cvId = new ObjectId();
        Cv cv = new Cv();
        cv.setId(cvId);
        cv.setCandidateId(candidateProfileId);

        when(cvRepository.findByIdAndCandidateId(cvId, candidateProfileId)).thenReturn(Optional.of(cv));
        when(applicationRepository.existsByCvId(cvId)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                candidateService.deleteCv(activeCandidate, cvId.toHexString()));
        assertEquals("CV_IN_USE", ex.getCode());
    }

    @Test
    void deleteCv_successWhenNotInUse() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));

        ObjectId cvId = new ObjectId();
        Cv cv = new Cv();
        cv.setId(cvId);
        cv.setCandidateId(candidateProfileId);

        when(cvRepository.findByIdAndCandidateId(cvId, candidateProfileId)).thenReturn(Optional.of(cv));
        when(applicationRepository.existsByCvId(cvId)).thenReturn(false);
        when(cvAnalysisRepository.existsByCvId(cvId)).thenReturn(false);

        candidateService.deleteCv(activeCandidate, cvId.toHexString());

        verify(cvRepository).delete(cv);
    }

    @Test
    void uploadCv_success() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));
        when(cvRepository.save(any(Cv.class))).thenAnswer(i -> {
            Cv c = i.getArgument(0);
            c.setId(new ObjectId());
            return c;
        });

        MockMultipartFile file = new MockMultipartFile(
                "file", "my_frontend_cv.pdf", "application/pdf",
                "%PDF-1.4 sample content".getBytes()
        );

        CvSummaryDto summary = candidateService.uploadCv(file, activeCandidate);

        assertNotNull(summary);
        assertTrue(summary.title().contains("my_frontend_cv"));
        assertEquals("uploaded", summary.source().type());
        assertEquals("pending", summary.parseInfo().status());
        assertTrue(summary.canViewFile());
        assertTrue(summary.canDelete());
        assertNull(summary.deleteBlockedReason());
    }

    @Test
    void uploadCv_rejectsNonPdf() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));

        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious.exe", "application/octet-stream",
                "NOT_A_PDF".getBytes()
        );

        assertThrows(UnsupportedFileTypeException.class, () ->
                candidateService.uploadCv(file, activeCandidate));
    }

    @Test
    void getCareer_emptyWhenNoCv() {
        when(profileRepository.findByUserId(userObjectId)).thenReturn(Optional.of(existingProfile));
        when(cvRepository.findFirstByCandidateIdOrderByCreatedAtDescIdDesc(candidateProfileId))
                .thenReturn(Optional.empty());

        CareerDto career = candidateService.getCareer(activeCandidate, null);

        assertNotNull(career);
        assertNull(career.cv());
        assertTrue(career.skills().isEmpty());
        assertTrue(career.experience().isEmpty());
    }
}
