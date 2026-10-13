package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.resumeanalyser.backend.dto.DashboardOverviewResponse;
import com.resumeanalyser.backend.dto.DashboardStatusStatsResponse;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.DashboardService;

@RestController
@RequestMapping("/api/hr/dashboard")
public class HrDashboardController {

    private final DashboardService dashboardService;

    public HrDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewResponse> getOverview(
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getOverview(recruiter)
        );
    }

    @GetMapping("/applications/stats")
    public ResponseEntity<DashboardStatusStatsResponse> getApplicationStats(
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getApplicationStats(recruiter)
        );
    }

    @GetMapping("/interviews/stats")
    public ResponseEntity<DashboardStatusStatsResponse> getInterviewStats(
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getInterviewStats(recruiter)
        );
    }
}