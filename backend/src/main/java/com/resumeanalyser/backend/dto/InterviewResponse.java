package com.resumeanalyser.backend.dto;

import java.time.Instant;

import com.resumeanalyser.backend.model.Interview;

public record InterviewResponse(
        String id,
        String applicationId,
        String scheduledBy,
        Instant scheduledAt,
        Integer durationMinutes,
        String mode,
        String meetingLink,
        String location,
        String status,
        String notes,
        Instant createdAt
) {

    public static InterviewResponse from(Interview interview) {
        return new InterviewResponse(
                interview.getId().toHexString(),
                interview.getApplicationId().toHexString(),
                interview.getScheduledBy().toHexString(),
                interview.getScheduledAt(),
                interview.getDurationMinutes(),
                interview.getMode(),
                interview.getMeetingLink(),
                interview.getLocation(),
                interview.getStatus(),
                interview.getNotes(),
                interview.getCreatedAt()
        );
    }
}