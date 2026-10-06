package com.resumeanalyser.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import java.nio.charset.StandardCharsets;
import java.util.Date;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

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
import com.resumeanalyser.backend.exception.GlobalExceptionHandler;
import jakarta.servlet.DispatcherType;

@SpringJUnitConfig(JwtAuthenticationTests.TestConfig.class)
@WebAppConfiguration
class JwtAuthenticationTests {
    private static final String SECRET = "jwt-authentication-test-secret-at-least-32-bytes";

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, JwtAuthenticationFilter.class, AuthController.class, AuthService.class,
            GlobalExceptionHandler.class})
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
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void missingOrNonBearerHeaderIsRejectedWithoutDatabaseLookup() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Unauthorized"));
        mvc.perform(get("/api/auth/me").header("Authorization", "Basic abc"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(repository);
    }

    @Test
    void malformedEmptyExpiredAndWronglySignedTokensAreRejected() throws Exception {
        String expired = new JwtService(SECRET, -60_000).generateToken(user);
        String wrongSignature = new JwtService(SECRET + "other-key", 60_000).generateToken(user);
        for (String token : new String[]{"", "invalid-token", expired, wrongSignature}) {
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(repository);
    }

    @Test
    void missingOrBlankSubjectNeverReachesRepository() throws Exception {
        for (String id : new String[]{null, "   "}) {
            user.setId(id);
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + jwtService.generateToken(user)))
                    .andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(repository);
    }

    @Test
    void deletedOrInactiveUserIsRejected() throws Exception {
        String token = jwtService.generateToken(user);
        when(repository.findById(user.getId())).thenReturn(Optional.empty());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        user.setStatus("inactive");
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void userWithoutRoleIsRejected() throws Exception {
        String token = jwtService.generateToken(user);
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        for (String role : new String[]{null, "   "}) {
            user.setRole(role);
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                    .andExpect(status().isUnauthorized());
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
        mvc.perform(get("/api/auth/login")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/other")).andExpect(status().isUnauthorized());
        verifyNoInteractions(repository);
    }

    @Test
    void registerWithoutTokenHashesPasswordAndReturnsCreated() throws Exception {
        when(repository.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId("new-user-id");
            assertTrue(passwordEncoder.matches("test-password", saved.getPasswordHash()));
            assertEquals("candidate", saved.getRole());
            return saved;
        });
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new@example.com\",\"password\":\"test-password\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("candidate"))
                .andExpect(jsonPath("$.emailVerified").value(false))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void clientCannotRegisterAsAdmin() throws Exception {
        when(repository.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId("new-user-id");
            assertEquals("candidate", saved.getRole());
            return saved;
        });
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new@example.com\",\"password\":\"test-password\",\"role\":\"admin\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("candidate"));
    }

    @Test
    void incorrectCredentialsReturn401() throws Exception {
        user.setPasswordHash(passwordEncoder.encode("correct-password"));
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"missing@example.com\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inactiveAndLockedAccountsCannotLogin() throws Exception {
        user.setPasswordHash(passwordEncoder.encode("test-password"));
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        for (String accountStatus : new String[]{"inactive", "locked"}) {
            user.setStatus(accountStatus);
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"user@example.com\",\"password\":\"test-password\"}"))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.status").value(403));
        }
    }

    @Test
    void duplicateEmailReturns409AndValidationReturns400() throws Exception {
        when(repository.existsByEmail("user@example.com")).thenReturn(true);
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"test-password\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.status").value(409));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"invalid\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void signedTokenWithoutExpirationIsInvalid() throws Exception {
        String token = Jwts.builder().subject(user.getId()).issuedAt(new Date())
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();
        assertFalse(jwtService.isTokenValid(token));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(repository);
    }

    @Test
    void existingAuthenticationIsNotOverwritten() throws Exception {
        var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                user, null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CANDIDATE")));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer invalid-token")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(authentication)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(user.getId()));
        verifyNoInteractions(repository);
    }

    @Test
    void roleAndEmailAreReadFromDatabaseAndFrontendIdentityIsIgnored() throws Exception {
        String token = jwtService.generateToken(user);
        user.setRole("candidate");
        user.setEmail("updated@example.com");
        when(repository.findById(user.getId())).thenReturn(Optional.of(user));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token)
                        .param("userId", "another-user").param("role", "admin").param("email", "attacker@example.com"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value("updated@example.com"))
                .andExpect(jsonPath("$.role").value("candidate"));
    }

    @Test
    void errorDispatchIsNotMaskedBySecurity() throws Exception {
        mvc.perform(post("/error").with(request -> {
                    request.setDispatcherType(DispatcherType.ERROR);
                    return request;
                }))
                .andExpect(status().isNotFound());
    }

    @Test
    void emailIsNormalizedBeforeValidationAndDatabaseLookup() throws Exception {
        when(repository.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertEquals("new@example.com", saved.getEmail());
            saved.setId("normalized-user-id");
            return saved;
        });
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"  NEW@Example.COM  \",\"password\":\"test-password\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("new@example.com"));
        verify(repository).existsByEmail("new@example.com");
        user.setPasswordHash(passwordEncoder.encode("test-password"));
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"  USER@Example.COM  \",\"password\":\"test-password\"}"))
                .andExpect(status().isOk());
        verify(repository).findByEmail("user@example.com");
    }

    @Test
    void concurrentDuplicateInsertReturnsConflict() throws Exception {
        when(repository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenThrow(new org.springframework.dao.DuplicateKeyException("internal database details"));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new@example.com\",\"password\":\"test-password\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("Email đã tồn tại"));
    }

    @Test
    void malformedJsonReturnsSafeBadRequest() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.trace").doesNotExist());
        verifyNoInteractions(repository);
    }
}
