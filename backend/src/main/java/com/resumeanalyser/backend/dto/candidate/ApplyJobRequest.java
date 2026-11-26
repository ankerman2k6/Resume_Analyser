package com.resumeanalyser.backend.dto.candidate;

import jakarta.validation.constraints.NotBlank;

public record ApplyJobRequest(
        @NotBlank String cvId,
        String coverNote) {}
