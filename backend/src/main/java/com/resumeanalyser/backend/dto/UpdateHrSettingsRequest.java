package com.resumeanalyser.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateHrSettingsRequest(
        @NotNull @Valid Profile profile,
        @NotNull @Valid Company company
) {
    public record Profile(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @Size(max = 30) String phone,
            @Size(max = 120) String position
    ) {}

    public record Company(
            @NotBlank @Size(max = 160) String name,
            @Size(max = 2000) String description,
            @Size(max = 120) String industry,
            @Size(max = 120) String size,
            @Size(max = 2048) String website,
            @Size(max = 2048) String logoUrl,
            @NotNull List<@NotNull @Valid Location> locations
    ) {}

    public record Location(
            @NotBlank @Size(max = 240) String address,
            @NotBlank @Size(max = 120) String city,
            @NotBlank @Size(max = 120) String country
    ) {}
}
