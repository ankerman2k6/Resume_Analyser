package com.resumeanalyser.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.resumeanalyser.backend.controller.AuthController;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.service.AuthService;

@SpringJUnitConfig(JwtAuthenticationTests.TestConfig.class)
@WebAppConfiguration
class JwtAuthenticationTests {
    private static final String SECRET = "jwt-authentication-test-secret-at-least-32-bytes";

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, JwtAuthenticationFilter.class, AuthController.class, AuthService.class})
    static class TestConfig {
        @Bean
        UserRepository userRepository() {
            return mock(UserRepository.class);
        }

        @Bean
        JwtService jwtService() {
            return new JwtService(SECRET, 60_000);
        }
    }

    @Autowired WebApplicationContext context;
    @Autowired UserRepository repository;
    @Autowired JwtService jwtService;
    @Autowired PasswordEncoder passwordEncoder;

    private MockMvc mvc;
    private User user;

    @BeforeEach
    void setUp() {
        reset(repository);
        SecurityContextHolder.clearContext();
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        user = new User();
        user.setId("test-user-id");
        user.setEmail("user@example.com");
        user.setRole("user");
        user.setStatus("active");
    }

    @Test
    void extractsIdEmailAndRoleFromGeneratedToken() {
        String token = jwtService.generateToken(user);
        assertEquals(user.getId(), jwtService.extractUserId(token));
        assertEquals(user.getEmail(), jwtService.extractEmail(token));
        assertEquals(user.getRole(), jwtService.extractRole(token));
    }

    @Test
    void validTokenReturnsCurrentUserAndDoesNotPersistAuthentication() throws Exception {
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + jwtService.generateToken(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value(user.getEmail()))
                .andExpect(jsonPath("$.role").value(user.getRole()))
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        verify(repository).findById(user.getId());
        mvc.perform(get("/api/auth/me")).andExpect(status().isForbidden());
    }

    @Test
    void missingOrNonBearerHeaderIsRejectedWithoutDatabaseLookup() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/me").header("Authorization", "Basic abc"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(repository);
    }

    @Test
    void malformedEmptyExpiredAndWronglySignedTokensAreRejected() throws Exception {
        String expired = new JwtService(SECRET, -60_000).generateToken(user);
        String wrongSignature = new JwtService(SECRET + "other-key", 60_000).generateToken(user);
        for (String token : new String[]{"", "invalid-token", expired, wrongSignature}) {
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isForbidden());
        }
        verifyNoInteractions(repository);
    }

    @Test
    void missingOrBlankSubjectNeverReachesRepository() throws Exception {
        for (String id : new String[]{null, "   "}) {
            user.setId(id);
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + jwtService.generateToken(user)))
                    .andExpect(status().isForbidden());
        }
        verifyNoInteractions(repository);
    }

    @Test
    void deletedOrInactiveUserIsRejected() throws Exception {
        String token = jwtService.generateToken(user);
        when(repository.findById(user.getId())).thenReturn(Optional.empty());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        user.setStatus("inactive");
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void userWithoutRoleIsRejected() throws Exception {
        String token = jwtService.generateToken(user);
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        for (String role : new String[]{null, "   "}) {
            user.setRole(role);
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void loginAcceptsCredentialsWithoutTokenOrCsrfAndIssuesUsableToken() throws Exception {
        user.setPasswordHash(passwordEncoder.encode("test-password"));
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"test-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String token = new tools.jackson.databind.ObjectMapper().readTree(body).get("token").asText();
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(user.getId()));
    }

    @Test
    void otherEndpointsAndNonPostLoginRequireAuthentication() throws Exception {
        mvc.perform(get("/api/auth/login")).andExpect(status().isForbidden());
        mvc.perform(get("/api/other")).andExpect(status().isForbidden());
        verifyNoInteractions(repository);
    }
}
