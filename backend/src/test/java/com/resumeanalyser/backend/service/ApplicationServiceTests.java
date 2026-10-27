package com.resumeanalyser.backend.service;

import com.resumeanalyser.backend.exception.*;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.repository.*;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTests {
    @Mock ApplicationRepository applications;
    @Mock JobRepository jobs;
    @Mock RecruiterIdentityService recruiterIdentity;
    ApplicationService service;
    ObjectId userId = new ObjectId(), owner = new ObjectId(), jobId = new ObjectId(), appId = new ObjectId();
    Job job;
    Application application;

    @BeforeEach
    void setup() {
        service = new ApplicationService(applications, jobs, recruiterIdentity);
        lenient().when(recruiterIdentity.requireProfileId(userId.toHexString())).thenReturn(owner);
        lenient().when(recruiterIdentity.requireUserId(userId.toHexString())).thenReturn(userId);
        job = new Job();
        job.setId(jobId);
        job.setRecruiterId(owner);
        application = new Application();
        application.setId(appId);
        application.setJobId(jobId);
        application.setCandidateId(new ObjectId());
        application.setCvId(new ObjectId());
        application.setStatus("interview");
        application.setAppliedAt(Instant.parse("2026-10-04T00:00:00Z"));
        application.setUpdatedAt(application.getAppliedAt());
        application.setStatusHistory(List.of(new Application.StatusChange("applied",
                application.getAppliedAt(), owner, "original note")));
    }

    @Test void listsApplicationsForOwnedJob() {
        when(jobs.findById(jobId)).thenReturn(Optional.of(job));
        when(applications.findByJobId(jobId)).thenReturn(List.of(application));
        assertEquals(List.of(application), service.getApplicationsByJob(jobId.toHexString(), userId.toHexString()));
    }

    @Test void returnsEmptyList() {
        when(jobs.findById(jobId)).thenReturn(Optional.of(job));
        when(applications.findByJobId(jobId)).thenReturn(List.of());
        assertTrue(service.getApplicationsByJob(jobId.toHexString(), userId.toHexString()).isEmpty());
    }

    @Test void rejectsInvalidResourceIdsBeforeDatabaseAccess() {
        assertThrows(IllegalArgumentException.class, () -> service.getApplicationsByJob("bad", userId.toHexString()));
        assertThrows(IllegalArgumentException.class, () -> service.updateStatus("bad", "shortlisted", userId.toHexString()));
        verifyNoInteractions(applications, jobs);
    }

    @Test void invalidRecruiterIsUnauthorized() {
        when(recruiterIdentity.requireProfileId("bad"))
                .thenThrow(new UnauthorizedException("Authenticated user ID is invalid"));
        when(recruiterIdentity.requireProfileId((String) null))
                .thenThrow(new UnauthorizedException("Authenticated user ID is invalid"));
        assertThrows(UnauthorizedException.class, () -> service.getApplicationsByJob(jobId.toHexString(), "bad"));
        assertThrows(UnauthorizedException.class, () -> service.updateStatus(appId.toHexString(), "shortlisted", null));
        verifyNoInteractions(applications, jobs);
    }

    @Test void missingJobIsNotFound() {
        when(jobs.findById(jobId)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.getApplicationsByJob(jobId.toHexString(), userId.toHexString()));
        verifyNoInteractions(applications);
    }

    @Test void unownedJobCannotBeListed() {
        job.setRecruiterId(new ObjectId());
        when(jobs.findById(jobId)).thenReturn(Optional.of(job));
        assertThrows(ForbiddenException.class, () -> service.getApplicationsByJob(jobId.toHexString(), userId.toHexString()));
        verifyNoInteractions(applications);
    }

    @Test void missingApplicationIsNotFound() {
        when(applications.findById(appId)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.updateStatus(appId.toHexString(), "shortlisted", userId.toHexString()));
        verifyNoInteractions(jobs);
    }

    @Test void rejectsNullAndUnsupportedStatus() {
        for (String status : new String[]{null, "", "SHORTLISTED", "applied", "invalid"}) {
            assertThrows(IllegalArgumentException.class, () -> service.updateStatus(appId.toHexString(), status, userId.toHexString()));
        }
        verifyNoInteractions(applications, jobs);
    }

    @Test void unownedApplicationCannotBeUpdated() {
        job.setRecruiterId(new ObjectId());
        when(applications.findById(appId)).thenReturn(Optional.of(application));
        when(jobs.findById(jobId)).thenReturn(Optional.of(job));
        assertThrows(ForbiddenException.class, () -> service.updateStatus(appId.toHexString(), "shortlisted", userId.toHexString()));
        verify(applications, never()).updateStatus(any(), any(), any(), any(), any());
    }

    @Test void missingOrNullApplicationJobIsNotFound() {
        when(applications.findById(appId)).thenReturn(Optional.of(application));
        when(jobs.findById(jobId)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.updateStatus(appId.toHexString(), "shortlisted", userId.toHexString()));
        application.setJobId(null);
        assertThrows(NotFoundException.class, () -> service.updateStatus(appId.toHexString(), "shortlisted", userId.toHexString()));
        verify(applications, never()).updateStatus(any(), any(), any(), any(), any());
    }

    @ParameterizedTest @ValueSource(strings = {"pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"})
    void updatesEveryAllowedStatusWithoutReplacingDocument(String status) {
        when(applications.findById(appId)).thenReturn(Optional.of(application));
        when(jobs.findById(jobId)).thenReturn(Optional.of(job));
        Instant before = Instant.now();
        when(applications.updateStatus(eq(appId), eq(jobId), eq(status), any(Instant.class), eq(userId)))
                .thenAnswer(invocation -> {
                    Instant changedAt = invocation.getArgument(3);
                    assertFalse(changedAt.isBefore(before));
                    assertFalse(changedAt.isAfter(Instant.now()));
                    Application updated = new Application();
                    updated.setStatus(status);
                    updated.setUpdatedAt(changedAt);
                    return Optional.of(updated);
                });
        var oldHistory = application.getStatusHistory();
        var oldCv = application.getCvId();
        var oldCandidate = application.getCandidateId();
        var result = service.updateStatus(appId.toHexString(), status, userId.toHexString());
        assertEquals(status, result.getStatus());
        assertNotNull(result.getUpdatedAt());
        assertEquals(jobId, application.getJobId());
        assertEquals(oldCv, application.getCvId());
        assertEquals(oldCandidate, application.getCandidateId());
        assertSame(oldHistory, application.getStatusHistory());
        assertEquals(Instant.parse("2026-10-04T00:00:00Z"), application.getAppliedAt());
        verify(applications, never()).save(any());
    }
}
