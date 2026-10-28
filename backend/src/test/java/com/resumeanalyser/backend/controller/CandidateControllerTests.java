package com.resumeanalyser.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.candidate.CandidateApplicationDto;
import com.resumeanalyser.backend.dto.candidate.CareerDto;
import com.resumeanalyser.backend.dto.candidate.CvSummaryDto;
import com.resumeanalyser.backend.dto.candidate.ProfileDto;
import com.resumeanalyser.backend.dto.candidate.StatsDto;
import com.resumeanalyser.backend.dto.candidate.UpdateProfileRequest;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.GlobalExceptionHandler;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtAuthenticationFilter;
import com.resumeanalyser.backend.security.JwtService;
import com.resumeanalyser.backend.security.SecurityConfig;
import com.resumeanalyser.backend.service.CandidateService;

@WebMvcTest(CandidateController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class,
        CandidateControllerTests.JwtTestConfig.class})
class CandidateControllerTests {

    @TestConfiguration
    static class JwtTestConfig {
        @Bean
        JwtService jwtService() {
            return new JwtService("candidate-controller-test-secret-at-least-32-bytes", 60_000);
        }
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    JwtService jwt;

    @MockitoBean
    CandidateService candidateService;

    @MockitoBean
    UserRepository userRepository;

    @TempDir
    Path tempDir;

    User candidate;
    String token;

    @BeforeEach
    void setUp() {
        candidate = new User();
        candidate.setId(new ObjectId().toHexString());
        candidate.setEmail("candidate@test.com");
        candidate.setRole("candidate");
        candidate.setStatus("active");
        candidate.setEmailVerified(true);

        when(userRepository.findById(candidate.getId())).thenReturn(Optional.of(candidate));
        token = "Bearer " + jwt.generateToken(candidate);
    }

    @Test
    void getProfile_success() throws Exception {
        ProfileDto profileDto = new ProfileDto(
                new ObjectId().toHexString(),
                candidate.getId(),
                "Nguyen Van A",
                candidate.getEmail(),
                "0901234567",
                null,
                new ProfileDto.LocationDto("Hanoi", "Vietnam"),
                "active",
                true,
                Instant.parse("2026-10-01T00:00:00Z"),
                Instant.parse("2026-10-02T00:00:00Z")
        );

        when(candidateService.getProfile(any(User.class))).thenReturn(profileDto);

        mvc.perform(get("/api/candidates/me/profile").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.fullName").value("Nguyen Van A"))
                .andExpect(jsonPath("$.email").value("candidate@test.com"))
                .andExpect(jsonPath("$.phone").value("0901234567"))
                .andExpect(jsonPath("$.location.city").value("Hanoi"));
    }

    @Test
    void getProfile_notFound() throws Exception {
        when(candidateService.getProfile(any(User.class)))
                .thenThrow(new NotFoundException("PROFILE_NOT_FOUND", "Chưa tạo hồ sơ ứng viên."));

        mvc.perform(get("/api/candidates/me/profile").header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROFILE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Chưa tạo hồ sơ ứng viên."));
    }

    @Test
    void putProfile_updateSuccess() throws Exception {
        ProfileDto profileDto = new ProfileDto(
                new ObjectId().toHexString(),
                candidate.getId(),
                "Nguyen Van B",
                candidate.getEmail(),
                "0987654321",
                null,
                new ProfileDto.LocationDto("Da Nang", "Vietnam"),
                "active",
                true,
                Instant.now(),
                Instant.now()
        );

        when(candidateService.saveProfile(any(User.class), any(UpdateProfileRequest.class)))
                .thenReturn(new CandidateService.SaveResult(profileDto, false));

        String body = """
                {
                    "fullName": "Nguyen Van B",
                    "phone": "0987654321",
                    "location": {
                        "city": "Da Nang",
                        "country": "Vietnam"
                    }
                }
                """;

        mvc.perform(put("/api/candidates/me/profile")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Nguyen Van B"))
                .andExpect(jsonPath("$.phone").value("0987654321"));
    }

    @Test
    void putProfile_createSuccessReturns201() throws Exception {
        ProfileDto profileDto = new ProfileDto(
                new ObjectId().toHexString(),
                candidate.getId(),
                "Nguyen Van C",
                candidate.getEmail(),
                "",
                null,
                new ProfileDto.LocationDto("", ""),
                "active",
                true,
                Instant.now(),
                Instant.now()
        );

        when(candidateService.saveProfile(any(User.class), any(UpdateProfileRequest.class)))
                .thenReturn(new CandidateService.SaveResult(profileDto, true));

        String body = """
                {
                    "fullName": "Nguyen Van C",
                    "phone": "",
                    "location": {
                        "city": "",
                        "country": ""
                    }
                }
                """;

        mvc.perform(put("/api/candidates/me/profile")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/candidates/me/profile"))
                .andExpect(jsonPath("$.fullName").value("Nguyen Van C"));
    }

    @Test
    void putProfile_validationError() throws Exception {
        String invalidBody = """
                {
                    "fullName": "",
                    "phone": "invalid-phone-string",
                    "location": null
                }
                """;

        mvc.perform(put("/api/candidates/me/profile")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors").isMap());
    }

    @Test
    void getStats_success() throws Exception {
        StatsDto statsDto = new StatsDto(
                2, 5, 1, 78.5, 2,
                new StatsDto.ApplicationCounts(5, 1, 1, 1, 1, 0, 1)
        );

        when(candidateService.getStats(any(User.class))).thenReturn(statsDto);

        mvc.perform(get("/api/candidates/me/stats").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cvCount").value(2))
                .andExpect(jsonPath("$.applicationCount").value(5))
                .andExpect(jsonPath("$.upcomingInterviewCount").value(1))
                .andExpect(jsonPath("$.avgMatchScore").value(78.5))
                .andExpect(jsonPath("$.applicationCounts.all").value(5))
                .andExpect(jsonPath("$.applicationCounts.applied").value(1));
    }

    @Test
    void getApplications_success() throws Exception {
        String appId = new ObjectId().toHexString();
        CandidateApplicationDto appDto = new CandidateApplicationDto(
                appId,
                new ObjectId().toHexString(),
                new ObjectId().toHexString(),
                "reviewing",
                Instant.now(),
                Instant.now(),
                false,
                new CandidateApplicationDto.JobInfo(
                        new ObjectId().toHexString(), "Frontend Developer", "full_time",
                        new CandidateApplicationDto.JobInfo.SalaryInfo(15000000L, 25000000L, "VND", false),
                        new CandidateApplicationDto.JobInfo.LocationInfo("123 Street", "Hanoi", "Vietnam", true)
                ),
                new CandidateApplicationDto.CompanyInfo(new ObjectId().toHexString(), "Tech Corp", "IT", null),
                null,
                null
        );

        PageResponse<CandidateApplicationDto> pageResponse = new PageResponse<>(
                List.of(appDto), 0, 10, 1, 1, true
        );

        when(candidateService.getApplications(any(User.class), eq("reviewing"), eq(0), eq(10)))
                .thenReturn(pageResponse);

        mvc.perform(get("/api/candidates/me/applications")
                        .param("filter", "reviewing")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0]._id").value(appId))
                .andExpect(jsonPath("$.content[0].status").value("reviewing"))
                .andExpect(jsonPath("$.content[0].canWithdraw").value(false))
                .andExpect(jsonPath("$.content[0].job.title").value("Frontend Developer"));
    }

    @Test
    void withdrawApplication_success() throws Exception {
        String appId = new ObjectId().toHexString();
        CandidateApplicationDto withdrawnDto = new CandidateApplicationDto(
                appId,
                new ObjectId().toHexString(),
                new ObjectId().toHexString(),
                "withdrawn",
                Instant.now(),
                Instant.now(),
                false,
                null, null, null, null
        );

        when(candidateService.withdrawApplication(any(User.class), eq(appId)))
                .thenReturn(withdrawnDto);

        mvc.perform(post("/api/candidates/me/applications/{id}/withdraw", appId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._id").value(appId))
                .andExpect(jsonPath("$.status").value("withdrawn"))
                .andExpect(jsonPath("$.canWithdraw").value(false));
    }

    @Test
    void withdrawApplication_conflictWhenNotApplied() throws Exception {
        String appId = new ObjectId().toHexString();
        when(candidateService.withdrawApplication(any(User.class), eq(appId)))
                .thenThrow(new ConflictException("APPLICATION_NOT_WITHDRAWABLE", "Chỉ có thể rút đơn khi đơn ở trạng thái đã nộp."));

        mvc.perform(post("/api/candidates/me/applications/{id}/withdraw", appId)
                        .header("Authorization", token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("APPLICATION_NOT_WITHDRAWABLE"));
    }

    @Test
    void getCvs_success() throws Exception {
        String cvId = new ObjectId().toHexString();
        CvSummaryDto cvSummaryDto = new CvSummaryDto(
                cvId,
                "CV Frontend",
                new CvSummaryDto.SourceInfo("upload", "cv.pdf", "application/pdf"),
                new CvSummaryDto.ParseInfoDto("completed", Instant.now(), "v1"),
                List.of(new CvSummaryDto.SkillDto("React", "technical", "intermediate", 2)),
                Instant.now(),
                Instant.now(),
                true,
                false,
                "CV_IN_USE"
        );

        PageResponse<CvSummaryDto> pageResponse = new PageResponse<>(List.of(cvSummaryDto), 0, 10, 1, 1, true);
        when(candidateService.getCvList(any(User.class), eq(0), eq(10))).thenReturn(pageResponse);

        mvc.perform(get("/api/candidates/me/cvs").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0]._id").value(cvId))
                .andExpect(jsonPath("$.content[0].canViewFile").value(true))
                .andExpect(jsonPath("$.content[0].canDelete").value(false))
                .andExpect(jsonPath("$.content[0].deleteBlockedReason").value("CV_IN_USE"));
    }

    @Test
    void getCvFile_success() throws Exception {
        String cvId = new ObjectId().toHexString();
        Path testPdf = tempDir.resolve("sample.pdf");
        Files.write(testPdf, "%PDF-1.4 test data".getBytes());

        when(candidateService.getCvFile(any(User.class), eq(cvId)))
                .thenReturn(new CandidateService.CvFileInfo(testPdf, "sample.pdf", "application/pdf"));

        mvc.perform(get("/api/candidates/me/cvs/{id}/file", cvId).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(content().bytes("%PDF-1.4 test data".getBytes()));
    }

    @Test
    void deleteCv_success() throws Exception {
        String cvId = new ObjectId().toHexString();
        doNothing().when(candidateService).deleteCv(any(User.class), eq(cvId));

        mvc.perform(delete("/api/candidates/me/cvs/{id}", cvId).header("Authorization", token))
                .andExpect(status().isNoContent());

        verify(candidateService).deleteCv(any(User.class), eq(cvId));
    }

    @Test
    void deleteCv_conflictWhenInUse() throws Exception {
        String cvId = new ObjectId().toHexString();
        doThrow(new ConflictException("CV_IN_USE", "CV đang được sử dụng."))
                .when(candidateService).deleteCv(any(User.class), eq(cvId));

        mvc.perform(delete("/api/candidates/me/cvs/{id}", cvId).header("Authorization", token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CV_IN_USE"));
    }

    @Test
    void getCareer_success() throws Exception {
        CareerDto careerDto = new CareerDto(
                new CareerDto.CvInfo(new ObjectId().toHexString(), "CV Frontend", "cv.pdf", null),
                List.of(new CareerDto.SkillDto("React", "technical", null, 0)),
                List.of(new CareerDto.ExperienceDto(
                        "Developer", "Company A", "Hanoi", "full_time", "2025-01", null, true,
                        "Building UI", List.of("Achievement 1"), List.of("React")
                )),
                List.of(new CareerDto.EducationDto(
                        "Bachelor", "IT", "University", "2021", "2025", "graduated",
                        new CareerDto.GpaDto(3.5, 4), null
                )),
                List.of(new CareerDto.CertificateDto("Cert A", "Issuer", "2025-06", "ID123", null, null))
        );

        when(candidateService.getCareer(any(User.class), any())).thenReturn(careerDto);

        mvc.perform(get("/api/candidates/me/career").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cv.title").value("CV Frontend"))
                .andExpect(jsonPath("$.skills[0].name").value("React"))
                .andExpect(jsonPath("$.skills[0].yearsOfExperience").value(0))
                .andExpect(jsonPath("$.experience[0].company").value("Company A"))
                .andExpect(jsonPath("$.education[0].gpa.value").value(3.5));
    }
}
