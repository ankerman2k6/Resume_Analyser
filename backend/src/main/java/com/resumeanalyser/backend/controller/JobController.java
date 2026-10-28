package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.JobResponse;
import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    /**
     * API Tìm kiếm việc làm theo từ khóa, ngành nghề và địa điểm
     * Ví dụ:
     * - /api/jobs/search?keyword=Java
     * - /api/jobs/search?profession=Công nghệ thông tin&location=Hà Nội
     * - /api/jobs/search?keyword=React&location=Hồ Chí Minh&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<JobResponse> result = jobService.searchJobs(keyword, profession, location, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * API Xem chi tiết một công việc theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable String id) {
        JobResponse job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }
}
