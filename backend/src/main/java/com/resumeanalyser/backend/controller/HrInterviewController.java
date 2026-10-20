package com.resumeanalyser.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.resumeanalyser.backend.dto.CreateInterviewRequest;
import com.resumeanalyser.backend.dto.InterviewResponse;
import com.resumeanalyser.backend.dto.UpdateInterviewRequest;
import com.resumeanalyser.backend.dto.UpdateInterviewStatusRequest;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.InterviewService;

@RestController
@RequestMapping("/api/hr")
public class HrInterviewController {

    private final InterviewService interviewService;

    public HrInterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/interviews")
    public ResponseEntity<InterviewResponse> createInterview(
            @RequestBody CreateInterviewRequest request,
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        InterviewResponse response =
                interviewService.createInterview(request, recruiter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewResponse>> getMyInterviews(
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                interviewService.getMyInterviews(recruiter)
        );
    }

    @GetMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> getInterviewById(
            @PathVariable String id,
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                interviewService.getInterviewById(id, recruiter)
        );
    }

    @GetMapping("/applications/{id}/interviews")
    public ResponseEntity<List<InterviewResponse>> getApplicationInterviews(
            @PathVariable String id,
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                interviewService.getApplicationInterviews(id, recruiter)
        );
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @PathVariable String id,
            @RequestBody UpdateInterviewRequest request,
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                interviewService.updateInterview(id, request, recruiter)
        );
    }

    @PatchMapping("/interviews/{id}/status")
    public ResponseEntity<InterviewResponse> updateInterviewStatus(
            @PathVariable String id,
            @RequestBody UpdateInterviewStatusRequest request,
            Authentication authentication) {

        User recruiter = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                interviewService.updateInterviewStatus(
                        id,
                        request.status(),
                        recruiter
                )
        );
    }
}