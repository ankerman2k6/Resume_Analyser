package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.resumeanalyser.backend.dto.DashboardOverviewResponse;
import com.resumeanalyser.backend.dto.DashboardStatusStatsResponse;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.DashboardService;
import com.resumeanalyser.backend.service.HrDashboardService;
import com.resumeanalyser.backend.dto.HrDashboardResponse;

@RestController
@RequestMapping("/api/hr/dashboard")
public class HrDashboardController {

    private final DashboardService dashboardService;
    private final HrDashboardService hrDashboardService;

    public HrDashboardController(DashboardService dashboardService, HrDashboardService hrDashboardService) {
        this.dashboardService = dashboardService;
        this.hrDashboardService = hrDashboardService;
    }

    @GetMapping
    public ResponseEntity<HrDashboardResponse> getDashboard() {
        return ResponseEntity.ok(hrDashboardService.getDashboard());
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
