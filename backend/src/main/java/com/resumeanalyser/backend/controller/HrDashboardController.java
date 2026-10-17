package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.HrDashboardResponse;
import com.resumeanalyser.backend.service.HrDashboardService;

@RestController
@RequestMapping("/api/hr/dashboard")
public class HrDashboardController {

    private final HrDashboardService hrDashboardService;

    public HrDashboardController(HrDashboardService hrDashboardService) {
        this.hrDashboardService = hrDashboardService;
    }

    @GetMapping
    public ResponseEntity<HrDashboardResponse> getDashboard() {
        return ResponseEntity.ok(hrDashboardService.getDashboard());
    }
}
