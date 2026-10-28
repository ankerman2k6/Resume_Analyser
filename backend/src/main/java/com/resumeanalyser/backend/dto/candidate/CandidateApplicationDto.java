package com.resumeanalyser.backend.dto.candidate;

import java.time.Instant;
import java.util.List;

public record CandidateApplicationDto(
        String _id,
        String cvId,
        String jobId,
        String status,
        Instant appliedAt,
        Instant updatedAt,
        boolean canWithdraw,
        JobInfo job,
        CompanyInfo company,
        AiAnalysisInfo aiAnalysis,
        InterviewInfo interview
) {
    public record JobInfo(
            String _id,
            String title,
            String employmentType,
            SalaryInfo salary,
            LocationInfo location
    ) {
        public record SalaryInfo(
                Long min,
                Long max,
                String currency,
                Boolean negotiable
        ) {}

        public record LocationInfo(
                String address,
                String city,
                String country,
                Boolean remote
        ) {}
    }

    public record CompanyInfo(
            String _id,
            String name,
            String industry,
            String logoUrl
    ) {}

    public record AiAnalysisInfo(
            String _id,
            Instant analyzedAt,
            Integer overallScore,
            ScoresInfo scores,
            String recommendation,
            List<String> matchedSkills,
            List<String> missingSkills,
            List<String> strengths,
            List<String> weaknesses
    ) {
        public record ScoresInfo(
                Integer overall,
                Integer skills,
                Integer experience,
                Integer education,
                Integer projects,
                Integer certificates
        ) {}
    }

    public record InterviewInfo(
            String _id,
            Instant scheduledAt,
            Integer durationMinutes,
            String mode,
            String location,
            String meetingLink,
            String status
    ) {}
}
