package com.resumeanalyser.backend.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.candidate.CandidateApplicationDto;
import com.resumeanalyser.backend.dto.candidate.CareerDto;
import com.resumeanalyser.backend.dto.candidate.CvSummaryDto;
import com.resumeanalyser.backend.dto.candidate.ProfileDto;
import com.resumeanalyser.backend.dto.candidate.StatsDto;
import com.resumeanalyser.backend.dto.candidate.UpdateProfileRequest;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.CandidateService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/candidates/me")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(candidateService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> saveProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        CandidateService.SaveResult result = candidateService.saveProfile(user, request);
        if (result.created()) {
            return ResponseEntity
                    .created(URI.create("/api/candidates/me/profile"))
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(result.dto());
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(result.dto());
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsDto> getStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(candidateService.getStats(user));
    }

    @GetMapping("/applications")
    public ResponseEntity<PageResponse<CandidateApplicationDto>> getApplications(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        if (page < 0) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số page phải lớn hơn hoặc bằng 0.");
        }
        if (size < 1 || size > 100) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số size phải từ 1 đến 100.");
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(candidateService.getApplications(user, filter, page, size));
    }

    @PostMapping("/applications/{applicationId}/withdraw")
    public ResponseEntity<CandidateApplicationDto> withdrawApplication(
            @PathVariable String applicationId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(candidateService.withdrawApplication(user, applicationId));
    }

    @GetMapping("/cvs")
    public ResponseEntity<PageResponse<CvSummaryDto>> getCvList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        if (page < 0) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số page phải lớn hơn hoặc bằng 0.");
        }
        if (size < 1 || size > 100) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số size phải từ 1 đến 100.");
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(candidateService.getCvList(user, page, size));
    }

    @GetMapping("/cvs/{cvId}/file")
    public ResponseEntity<Resource> getCvFile(
            @PathVariable String cvId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        CandidateService.CvFileInfo fileInfo = candidateService.getCvFile(user, cvId);

        Resource resource = new FileSystemResource(fileInfo.filePath());
        String encodedFileName = URLEncoder.encode(fileInfo.fileName(), StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cv.pdf\"; filename*=UTF-8''" + encodedFileName)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }

    @DeleteMapping("/cvs/{cvId}")
    public ResponseEntity<Void> deleteCv(
            @PathVariable String cvId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        candidateService.deleteCv(user, cvId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/career")
    public ResponseEntity<CareerDto> getCareer(
            @RequestParam(required = false) String cvId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(candidateService.getCareer(user, cvId));
    }
}
