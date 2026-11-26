package com.resumeanalyser.backend.controller;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.resumeanalyser.backend.dto.HrSettingsResponse;
import com.resumeanalyser.backend.dto.UpdateHrSettingsRequest;
import com.resumeanalyser.backend.exception.GlobalExceptionHandler;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtAuthenticationFilter;
import com.resumeanalyser.backend.security.JwtService;
import com.resumeanalyser.backend.security.SecurityConfig;
import com.resumeanalyser.backend.service.HrSettingsService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HrSettingsController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class,
        HrSettingsControllerTests.JwtTestConfig.class})
class HrSettingsControllerTests {
    @TestConfiguration
    static class JwtTestConfig {
        @Bean JwtService jwtService() {
            return new JwtService("settings-controller-test-secret-at-least-32-bytes", 60_000);
        }
    }

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean HrSettingsService service;
    @MockitoBean UserRepository users;
    User recruiter;
    String token;

    @BeforeEach void setup() {
        recruiter = new User();
        recruiter.setId(new ObjectId().toHexString());
        recruiter.setEmail("hr@example.test");
        recruiter.setRole("recruiter");
        recruiter.setStatus("active");
        when(users.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));
        token = "Bearer " + jwt.generateToken(recruiter);
    }

    @Test void getUsesAuthenticatedRecruiterAndNoStore() throws Exception {
        var response = new HrSettingsResponse(
                new HrSettingsResponse.Profile("HR", "hr@example.test", "0900", "Recruiter"),
                new HrSettingsResponse.Company("Company", "Description", "Tech", "50",
                        "https://example.test", "https://example.test/logo.png",
                        List.of(new HrSettingsResponse.Location("1 Street", "Hanoi", "Vietnam"))));
        when(service.getSettings(recruiter)).thenReturn(response);

        mvc.perform(get("/api/hr/settings").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.profile.email").value("hr@example.test"))
                .andExpect(jsonPath("$.company.locations[0].city").value("Hanoi"));
        verify(service).getSettings(recruiter);
    }

    @Test void putValidatesAndUsesAuthenticatedRecruiter() throws Exception {
        var response = new HrSettingsResponse(
                new HrSettingsResponse.Profile("New HR", "new@example.test", "", ""),
                new HrSettingsResponse.Company("New company", "", "", "", "", "", List.of()));
        when(service.updateSettings(eq(recruiter), any(UpdateHrSettingsRequest.class))).thenReturn(response);
        String body = """
                {"profile":{"fullName":"New HR","email":"new@example.test","phone":"","position":""},
                 "company":{"name":"New company","description":"","industry":"","size":"",
                            "website":"","logoUrl":"","locations":[]}}
                """;

        mvc.perform(put("/api/hr/settings").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.fullName").value("New HR"))
                .andExpect(jsonPath("$.company.name").value("New company"));
        verify(service).updateSettings(eq(recruiter), any(UpdateHrSettingsRequest.class));

        mvc.perform(put("/api/hr/settings").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("new@example.test", "invalid-email")))
                .andExpect(status().isBadRequest());
    }

    @Test void bothEndpointsRequireRecruiterJwt() throws Exception {
        mvc.perform(get("/api/hr/settings")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/hr/settings").contentType(MediaType.APPLICATION_JSON)
                .content("{}")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}
