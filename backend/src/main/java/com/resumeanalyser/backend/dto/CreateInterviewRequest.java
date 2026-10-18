package com.resumeanalyser.backend.dto;

import java.time.Instant;

public record CreateInterviewRequest(
        String applicationId,
        Instant scheduledAt,
        Integer durationMinutes,
        String mode,
        String meetingLink,
        String location,
        String notes
) {}