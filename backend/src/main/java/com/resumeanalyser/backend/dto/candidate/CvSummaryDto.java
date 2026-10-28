package com.resumeanalyser.backend.dto.candidate;

import java.time.Instant;
import java.util.List;

public record CvSummaryDto(
        String _id,
        String title,
        SourceInfo source,
        ParseInfoDto parseInfo,
        List<SkillDto> skills,
        Instant createdAt,
        Instant updatedAt,
        boolean canViewFile,
        boolean canDelete,
        String deleteBlockedReason
) {
    public record SourceInfo(
            String type,
            String fileName,
            String mimeType
    ) {}

    public record ParseInfoDto(
            String status,
            Instant parsedAt,
            String parserVersion
    ) {}

    public record SkillDto(
            String name,
            String category,
            String level,
            Integer yearsOfExperience
    ) {}
}
