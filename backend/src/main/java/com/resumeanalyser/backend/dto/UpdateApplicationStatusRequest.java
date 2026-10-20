package com.resumeanalyser.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateApplicationStatusRequest(
        @NotBlank
        @Pattern(regexp = "pending|reviewing|shortlisted|interview|accepted|rejected",
                message = "Invalid application status") String status
) {}
