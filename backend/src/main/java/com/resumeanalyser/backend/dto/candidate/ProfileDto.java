package com.resumeanalyser.backend.dto.candidate;

import java.time.Instant;

public record ProfileDto(
        String _id,
        String userId,
        String fullName,
        String email,
        String phone,
        String avatarUrl,
        LocationDto location,
        String accountStatus,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt
) {
    public record LocationDto(
            String city,
            String country
    ) {}
}
