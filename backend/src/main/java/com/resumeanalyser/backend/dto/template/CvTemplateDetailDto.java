package com.resumeanalyser.backend.dto.template;

import java.util.List;

public record CvTemplateDetailDto(
        String id,
        String name,
        String description,
        String thumbnailUrl,
        String templateUrl,
        String status,
        EditorSchemaDto editorSchema
) {
    public record EditorSchemaDto(
            int version,
            List<SectionDto> sections
    ) {
    }

    public record SectionDto(
            String key,
            String label,
            boolean required
    ) {
    }
}
