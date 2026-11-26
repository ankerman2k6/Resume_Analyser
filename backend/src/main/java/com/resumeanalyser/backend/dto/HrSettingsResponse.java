package com.resumeanalyser.backend.dto;

import java.util.List;

public record HrSettingsResponse(Profile profile, Company company) {
    public record Profile(String fullName, String email, String phone, String position) {}
    public record Company(String name, String description, String industry, String size,
                          String website, String logoUrl, List<Location> locations) {}
    public record Location(String address, String city, String country) {}
}
