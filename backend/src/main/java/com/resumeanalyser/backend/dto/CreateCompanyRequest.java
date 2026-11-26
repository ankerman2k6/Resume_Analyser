package com.resumeanalyser.backend.dto;

import java.util.List;

import com.resumeanalyser.backend.dto.UpdateHrSettingsRequest.Location;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCompanyRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 2000) String description,
        @NotBlank @Size(max = 120) String industry,
        @NotBlank @Size(max = 120) String size,
        @Size(max = 2048) String website,
        @Size(max = 2048) String logoUrl,
        @NotEmpty List<@NotNull @Valid Location> locations
) {}
