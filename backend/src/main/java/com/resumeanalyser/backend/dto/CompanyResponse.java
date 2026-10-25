package com.resumeanalyser.backend.dto;

import java.time.Instant;
import java.util.List;

public record CompanyResponse(
        String id,
        String name,
        String industry,
        String logoUrl,
        String description,
        List<LocationResponse> locations,
        String size,
        String website,
        Instant createdAt,
        Instant updatedAt
) {
    public record LocationResponse(String address, String city, String country) {}
}
