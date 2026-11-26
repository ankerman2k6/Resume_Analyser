package com.resumeanalyser.backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.HrSettingsResponse;
import com.resumeanalyser.backend.dto.UpdateHrSettingsRequest;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.HrSettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hr/settings")
public class HrSettingsController {
    private final HrSettingsService settingsService;

    public HrSettingsController(HrSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<HrSettingsResponse> getSettings(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(settingsService.getSettings(user));
    }

    @PutMapping
    public ResponseEntity<HrSettingsResponse> updateSettings(
            @Valid @RequestBody UpdateHrSettingsRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(settingsService.updateSettings(user, request));
    }
}
