package com.resumeanalyser.backend.dto;

import java.time.Instant;
import java.util.List;
import com.resumeanalyser.backend.model.Application;

public record HrApplicationResponse(
        String id, String jobId, String candidateId, String cvId,
        String fullName, String email, String phone, String cvUrl,
        String status, Instant appliedAt, Instant updatedAt,
        List<Application.StatusChange> statusHistory
) {}
