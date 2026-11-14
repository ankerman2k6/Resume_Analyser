package com.resumeanalyser.backend.dto.template;

public record CvTemplateSummaryDto(
        String id,
        String name,
        String description,
        String thumbnailUrl,
        String status
) {
}
