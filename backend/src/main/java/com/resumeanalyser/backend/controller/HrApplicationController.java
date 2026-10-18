package com.resumeanalyser.backend.controller;

import java.util.List;
import com.resumeanalyser.backend.dto.UpdateApplicationStatusRequest;
import com.resumeanalyser.backend.exception.UnauthorizedException;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr")
public class HrApplicationController {
    private final ApplicationService applicationService;

    public HrApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<Application>> getApplications(
            @PathVariable String jobId, Authentication authentication) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId, recruiterId(authentication)));
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
