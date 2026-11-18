package com.resumeanalyser.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.resumeanalyser.backend.model.*;
import com.resumeanalyser.backend.service.AdminModerationService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminModerationService moderation;

    public AdminController(AdminModerationService moderation) {
        this.moderation = moderation;
    }

    public record CompanyReviewRequest(CompanyStatus status) {}

    @GetMapping("/companies")
    public List<Company> companies(
            @RequestParam(defaultValue = "incheck") CompanyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return moderation.companies(status, page, size);
    }

    @GetMapping("/companies/{id}")
    public Company company(@PathVariable String id) {
        return moderation.company(id);
    }

    @PatchMapping("/companies/{id}/review")
    public Company reviewCompany(
            @PathVariable String id,
            @RequestBody CompanyReviewRequest request) {
        return moderation.reviewCompany(id, request.status());
    }

    @GetMapping("/jobs")
    public List<Job> jobs(
            @RequestParam(defaultValue = "draft") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return moderation.jobs(status, page, size);
    }

    @GetMapping("/jobs/{id}")
    public Job job(@PathVariable String id) {
        return moderation.job(id);
    }

    @PatchMapping("/jobs/{id}/approve")
    public Job approveJob(@PathVariable String id) {
        return moderation.approveJob(id);
    }
}
