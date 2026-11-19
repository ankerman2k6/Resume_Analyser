package com.resumeanalyser.backend.service;

import com.resumeanalyser.backend.model.*;
import com.resumeanalyser.backend.repository.*;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.NotFoundException;
import java.time.Instant;
import java.util.*;
import java.nio.file.*;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class HrApplicationDetailsServiceTest {
    final ApplicationService applications = mock(ApplicationService.class);
    final ApplicationRepository rows = mock(ApplicationRepository.class);
    final CandidateProfileRepository profiles = mock(CandidateProfileRepository.class);
    final UserRepository users = mock(UserRepository.class);
    final CvRepository cvs = mock(CvRepository.class);
    @TempDir Path root;

    HrApplicationDetailsService service() {
        return new HrApplicationDetailsService(applications, rows, profiles, users, cvs, root.toString());
    }

    @Test void joinsContactInformationAndPreservesApplicationFields() {
        Application app = new Application();
        app.setId(new ObjectId()); app.setJobId(new ObjectId());
        app.setCandidateId(new ObjectId()); app.setCvId(new ObjectId());
        app.setStatus("applied"); app.setAppliedAt(Instant.parse("2026-10-25T00:00:00Z"));
        CandidateProfile profile = new CandidateProfile();
        profile.setId(app.getCandidateId()); profile.setUserId(new ObjectId());
        profile.setFullName("Họ tên hồ sơ"); profile.setPhone("0900000000");
        User user = new User(); user.setId(profile.getUserId().toHexString()); user.setEmail("contact@example.test");
        Cv cv = new Cv(); cv.setId(app.getCvId()); cv.setCandidateId(app.getCandidateId());
        cv.setSource(new Cv.Source("uploaded", "cv.pdf", root.resolve("cv.pdf").toString(), "application/pdf"));
        cv.setSkills(List.of(new Cv.Skill(" Java ", "Backend", null, 3),
                new Cv.Skill("Java", "Backend", null, 3),
                new Cv.Skill("Spring Boot", "Backend", null, 2)));
        Cv.Experience first = new Cv.Experience();
        first.setStartDate("2020-01"); first.setEndDate("2021-12");
        Cv.Experience overlapping = new Cv.Experience();
        overlapping.setStartDate("2021-01"); overlapping.setEndDate("2022-12");
        cv.setExperience(List.of(first, overlapping));
        when(applications.getApplicationsByJob("job", "hr")).thenReturn(List.of(app));
        when(profiles.findAllById(any())).thenReturn(List.of(profile));
        when(users.findAllById(any())).thenReturn(List.of(user));
        when(cvs.findAllById(any())).thenReturn(List.of(cv));
        var result = service().getByJob("job", "hr").getFirst();
        assertEquals("Họ tên hồ sơ", result.fullName());
        assertEquals("contact@example.test", result.email());
        assertEquals("0900000000", result.phone());
        assertEquals(app.getAppliedAt(), result.appliedAt());
        assertEquals("applied", result.status());
        assertEquals("/api/hr/applications/" + app.getId() + "/cv/file", result.cvUrl());
        assertFalse(result.cvUrl().contains(root.toString()));
        assertEquals(List.of("Java", "Spring Boot"), result.skills());
        assertEquals(3.0, result.experienceYears());
    }

    @Test void unauthorizedJobNeverLoadsContactInformation() {
        when(applications.getApplicationsByJob("job", "hr")).thenThrow(new ForbiddenException("Forbidden"));
        assertThrows(ForbiddenException.class, () -> service().getByJob("job", "hr"));
        verifyNoInteractions(profiles, users, cvs);
    }

    @Test void missingRelationsKeepApplicationVisible() {
        Application app = new Application(); app.setId(new ObjectId()); app.setStatus("pending");
        when(applications.getApplicationsByJob("job", "hr")).thenReturn(List.of(app));
        when(profiles.findAllById(any())).thenReturn(List.of());
        when(users.findAllById(any())).thenReturn(List.of());
        when(cvs.findAllById(any())).thenReturn(List.of());
        var result = service().getByJob("job", "hr").getFirst();
        assertEquals(app.getId().toHexString(), result.id());
        assertNull(result.fullName()); assertNull(result.cvUrl());
        assertEquals(List.of(), result.skills());
        assertNull(result.experienceYears());
    }

    @Test void mismatchedCvDoesNotExposeSkillsOrExperience() {
        Application app = new Application(); app.setId(new ObjectId()); app.setCvId(new ObjectId());
        app.setCandidateId(new ObjectId());
        Cv cv = new Cv(); cv.setId(app.getCvId()); cv.setCandidateId(new ObjectId());
        cv.setSkills(List.of(new Cv.Skill("Private skill", "Other", null, null)));
        Cv.Experience experience = new Cv.Experience();
        experience.setStartDate("2020"); experience.setEndDate("2023");
        cv.setExperience(List.of(experience));
        when(applications.getApplicationsByJob("job", "hr")).thenReturn(List.of(app));
        when(profiles.findAllById(any())).thenReturn(List.of());
        when(users.findAllById(any())).thenReturn(List.of());
        when(cvs.findAllById(any())).thenReturn(List.of(cv));
        var result = service().getByJob("job", "hr").getFirst();
        assertEquals(List.of(), result.skills());
        assertNull(result.experienceYears());
    }

    @Test void rejectsCvFilesOutsideStorageRoot() throws Exception {
        Application app = new Application(); app.setId(new ObjectId()); app.setJobId(new ObjectId());
        app.setCvId(new ObjectId()); app.setCandidateId(new ObjectId());
        when(rows.findById(app.getId())).thenReturn(Optional.of(app));
        Cv cv = new Cv();
        cv.setSource(new Cv.Source("uploaded", "cv.pdf", root.resolve("../outside.pdf").toString(), "application/pdf"));
        when(cvs.findByIdAndCandidateId(app.getCvId(), app.getCandidateId())).thenReturn(Optional.of(cv));
        assertThrows(NotFoundException.class, () -> service().getCvFile(app.getId().toHexString(), "hr"));
        verify(applications).getApplicationsByJob(app.getJobId().toHexString(), "hr");
    }
}
