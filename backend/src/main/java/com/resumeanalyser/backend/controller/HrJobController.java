package com.resumeanalyser.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.CreateJobRequest;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.JobService;

@RestController
@RequestMapping("/api/hr/jobs")
public class HrJobController {

    private final JobService jobService;

    public HrJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getMyJobs(
            Authentication authentication) {

        // Lấy User đã được xác thực từ JWT filter
        User recruiter = (User) authentication.getPrincipal();

        List<Job> jobs = jobService.getMyJobs(recruiter);

        return ResponseEntity.ok(jobs);
    }

    //Tìm job theo ID
    @GetMapping("{id}")
    public ResponseEntity<Job> getJobById(
        @PathVariable String id,
        Authentication authentication) {

    User recruiter = (User) authentication.getPrincipal();

    Job job = jobService.getJobById(id, recruiter);

    return ResponseEntity.ok(job);
}

    //Sửa job theo ID
    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
        @PathVariable String id,
        @RequestBody CreateJobRequest request,
        Authentication authentication) {

    User recruiter = (User) authentication.getPrincipal();

    Job updatedJob = jobService.updateJob(
            id,
            request,
            recruiter
    );

    return ResponseEntity.ok(updatedJob);
}
}