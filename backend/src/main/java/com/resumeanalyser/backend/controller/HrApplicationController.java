package com.resumeanalyser.backend.controller;

import java.util.List;
import com.resumeanalyser.backend.dto.UpdateApplicationStatusRequest;
import com.resumeanalyser.backend.exception.UnauthorizedException;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.ApplicationService;
import com.resumeanalyser.backend.service.HrApplicationDetailsService;
import com.resumeanalyser.backend.dto.HrApplicationResponse;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr")
public class HrApplicationController {
    private final ApplicationService applicationService;
    private final HrApplicationDetailsService detailsService;

    public HrApplicationController(ApplicationService applicationService, HrApplicationDetailsService detailsService) {
        this.applicationService = applicationService;
        this.detailsService = detailsService;
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<HrApplicationResponse>> getApplications(
            @PathVariable String jobId, Authentication authentication) {
        return ResponseEntity.ok(detailsService.getByJob(jobId, recruiterId(authentication)));
    }

    @GetMapping("/applications/{id}/cv/file")
    public ResponseEntity<Resource> getCvFile(@PathVariable String id, Authentication authentication) {
        Resource file = new FileSystemResource(detailsService.getCvFile(id, recruiterId(authentication)));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"cv.pdf\"")
                .header("Cache-Control", "no-store")
                .header("X-Content-Type-Options", "nosniff").body(file);
    }

    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable String id, @Valid @RequestBody UpdateApplicationStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request.status(), recruiterId(authentication)));
    }

    private static String recruiterId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Authenticated user is required");
        }
        return user.getId();
    }
}
