package com.resumeanalyser.backend.controller;

import java.util.Map;

import com.resumeanalyser.backend.dto.CreateJobRequest;
import com.resumeanalyser.backend.dto.UpdateJobStatusRequest;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.JobService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr")
public class HrController {

    private final JobService jobService;

    // Constructor Injection
    public HrController(JobService jobService) {
        this.jobService = jobService;
    }

    // API kiểm tra quyền HR
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of(
                "message", "HR access successful",
                "role", "recruiter"
        ));
    }

    // API tạo Job mới
    @PostMapping("/jobs")
    public ResponseEntity<Job> createJob(
            @RequestBody CreateJobRequest request,
            Authentication authentication) {

        // Lấy tài khoản HR từ JWT
        User recruiter = (User) authentication.getPrincipal();

        // Gọi Service để tạo Job
        Job createdJob = jobService.createJob(request, recruiter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdJob);
    }


    // API Sửa trạng thái job
    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<Job> updateJobStatus(
        @PathVariable String id,
        @RequestBody UpdateJobStatusRequest request,
        Authentication authentication) {

    User recruiter = (User) authentication.getPrincipal();

    Job updatedJob = jobService.updateJobStatus(
            id,
            request.status(),
            recruiter
    );

    return ResponseEntity.ok(updatedJob);
    }


    //API xóa job
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(
        @PathVariable String id,
        Authentication authentication) {

    User recruiter = (User) authentication.getPrincipal();

    jobService.deleteJob(id, recruiter);

    return ResponseEntity.noContent().build();
}
}