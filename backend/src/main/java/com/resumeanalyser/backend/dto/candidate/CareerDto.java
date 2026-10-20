package com.resumeanalyser.backend.dto.candidate;

import java.time.Instant;
import java.util.List;

public record CareerDto(
        CvInfo cv,
        List<SkillDto> skills,
        List<ExperienceDto> experience,
        List<EducationDto> education,
        List<CertificateDto> certificates
) {
    public record CvInfo(
            String _id,
            String title,
            String fileName,
            ParseInfoDto parseInfo
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

    public record ExperienceDto(
            String position,
            String company,
            String location,
            String employmentType,
            String startDate,
            String endDate,
            Boolean current,
            String description,
            List<String> achievements,
            List<String> technologies
    ) {}

    public record EducationDto(
            String degree,
            String major,
            String institution,
            String startDate,
            String endDate,
            String status,
            GpaDto gpa,
            String description
    ) {}

    public record GpaDto(
            Double value,
            Integer scale
    ) {}

    public record CertificateDto(
            String name,
            String issuer,
            String issueDate,
            String credentialId,
            String credentialUrl,
            String expirationDate
    ) {}
}
