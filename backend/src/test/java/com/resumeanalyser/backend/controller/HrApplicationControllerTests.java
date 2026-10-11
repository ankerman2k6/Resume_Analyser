package com.resumeanalyser.backend.controller;

import com.resumeanalyser.backend.exception.*;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.*;
import com.resumeanalyser.backend.service.ApplicationService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@WebMvcTest(HrApplicationController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class,
        HrApplicationControllerTests.JwtTestConfig.class})
class HrApplicationControllerTests {
    @TestConfiguration
    static class JwtTestConfig {
        @Bean JwtService jwtService() {
            return new JwtService("application-controller-test-secret-at-least-32-bytes", 60_000);
        }
    }
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean ApplicationService service;
    @MockitoBean UserRepository users;
    User recruiter;
    String token;
    String jobId = new ObjectId().toHexString();
    String appId = new ObjectId().toHexString();

    @BeforeEach void setup() {
        recruiter = new User();
        recruiter.setId(new ObjectId().toHexString());
        recruiter.setEmail("hr@test.invalid");
        recruiter.setStatus("active");
        recruiter.setRole("recruiter");
        when(users.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));
        token = "Bearer " + jwt.generateToken(recruiter);
    }

    @Test void getUsesVerifiedUserIdAndSerializesApplications() throws Exception {
        Application application = new Application();
        application.setId(new ObjectId(appId));
        application.setJobId(new ObjectId(jobId));
        application.setCandidateId(new ObjectId());
        application.setCvId(new ObjectId());
        application.setStatus("interview");
        when(service.getApplicationsByJob(jobId, recruiter.getId())).thenReturn(List.of(application));
        mvc.perform(get("/api/hr/jobs/{id}/applications", jobId).header("Authorization", token)
                        .param("recruiterId", new ObjectId().toHexString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(appId))
                .andExpect(jsonPath("$[0].jobId").value(jobId))
                .andExpect(jsonPath("$[0].status").value("interview"));
        verify(service).getApplicationsByJob(jobId, recruiter.getId());
    }

    @Test void getEmptyApplicationsIsEmptyJsonArray() throws Exception {
        when(service.getApplicationsByJob(jobId, recruiter.getId())).thenReturn(List.of());
        mvc.perform(get("/api/hr/jobs/{id}/applications", jobId).header("Authorization", token))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test void getMapsBadIdMissingJobAndForbiddenOwner() throws Exception {
        for (RuntimeException error : List.of(new IllegalArgumentException("Invalid Job ID"),
                new NotFoundException("Job not found"), new ForbiddenException("Forbidden"))) {
            doThrow(error).when(service).getApplicationsByJob(jobId, recruiter.getId());
            int expected = error instanceof IllegalArgumentException ? 400 : error instanceof NotFoundException ? 404 : 403;
            mvc.perform(get("/api/hr/jobs/{id}/applications", jobId).header("Authorization", token))
                    .andExpect(status().is(expected)).andExpect(jsonPath("$.status").value(expected));
        }
    }

    @Test void patchReturnsUpdatedApplicationAndHistory() throws Exception {
        Application updated = new Application();
        updated.setId(new ObjectId(appId));
        updated.setStatus("shortlisted");
        updated.setUpdatedAt(Instant.parse("2026-10-11T00:00:00Z"));
        updated.setStatusHistory(List.of(new Application.StatusChange("shortlisted", updated.getUpdatedAt(),
                new ObjectId(recruiter.getId()), null)));
        when(service.updateStatus(appId, "shortlisted", recruiter.getId())).thenReturn(updated);
        mvc.perform(patch("/api/hr/applications/{id}/status", appId).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"shortlisted\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(appId))
                .andExpect(jsonPath("$.status").value("shortlisted"))
                .andExpect(jsonPath("$.updatedAt").value("2026-10-11T00:00:00Z"))
                .andExpect(jsonPath("$.statusHistory[0].changedBy").value(recruiter.getId()));
    }

    @Test void patchMapsBadIdMissingApplicationAndForbiddenOwner() throws Exception {
        for (RuntimeException error : List.of(new IllegalArgumentException("Invalid Application ID"),
                new NotFoundException("Application not found"), new ForbiddenException("Forbidden"))) {
            doThrow(error).when(service).updateStatus(appId, "shortlisted", recruiter.getId());
            int expected = error instanceof IllegalArgumentException ? 400 : error instanceof NotFoundException ? 404 : 403;
            mvc.perform(patch("/api/hr/applications/{id}/status", appId).header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"shortlisted\"}"))
                    .andExpect(status().is(expected)).andExpect(jsonPath("$.status").value(expected));
        }
    }

    @Test void patchRejectsInvalidStatusMissingStatusAndMalformedJson() throws Exception {
        for (String body : List.of("{}", "{\"status\":null}", "{\"status\":\"invalid\"}",
                "{\"status\":\"SHORTLISTED\"}", "{\"status\":\"\"}", "{")) {
            mvc.perform(patch("/api/hr/applications/{id}/status", appId).header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(service);
    }

    @Test void bothEndpointsRequireJwt() throws Exception {
        mvc.perform(get("/api/hr/jobs/{id}/applications", jobId)).andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/hr/applications/{id}/status", appId)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"shortlisted\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test void invalidJwtIsUnauthorized() throws Exception {
        mvc.perform(get("/api/hr/jobs/{id}/applications", jobId).header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/hr/applications/{id}/status", appId).header("Authorization", "Bearer invalid")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"shortlisted\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test void databaseRoleOverridesJwtRoleForBothEndpoints() throws Exception {
        recruiter.setRole("candidate");
        mvc.perform(get("/api/hr/jobs/{id}/applications", jobId).header("Authorization", token))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/hr/applications/{id}/status", appId).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"shortlisted\"}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test void unexpectedOrMissingPrincipalIsUnauthorizedInsteadOfClassCastOrNullPointer() {
        var controller = new HrApplicationController(service);
        assertThrows(UnauthorizedException.class, () -> controller.getApplications(jobId, null));
        var auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                "hr@test.invalid", null, List.of());
        assertThrows(UnauthorizedException.class, () -> controller.getApplications(jobId, auth));
        verifyNoInteractions(service);
    }
}
