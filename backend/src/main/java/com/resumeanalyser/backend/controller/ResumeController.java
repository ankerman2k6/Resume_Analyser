package com.resumeanalyser.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.resumeanalyser.backend.dto.ResumeResponse;
import com.resumeanalyser.backend.dto.candidate.CvSummaryDto;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.CandidateService;
import com.resumeanalyser.backend.service.ResumeService;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final CandidateService candidateService;

    public ResumeController(ResumeService resumeService, CandidateService candidateService) {
        this.resumeService = resumeService;
        this.candidateService = candidateService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CvSummaryDto> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        CvSummaryDto response = candidateService.uploadCv(file, user);

        return ResponseEntity
                .created(URI.create("/api/candidates/me/cvs/" + response._id() + "/file"))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(resumeService.getUserResumes(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable String id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(resumeService.getResumeById(id, user));
    }
}
