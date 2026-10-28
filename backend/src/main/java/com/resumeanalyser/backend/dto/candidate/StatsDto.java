package com.resumeanalyser.backend.dto.candidate;

public record StatsDto(
        int cvCount,
        int applicationCount,
        int upcomingInterviewCount,
        Double avgMatchScore,
        int analyzedApplicationCount,
        ApplicationCounts applicationCounts
) {
    public record ApplicationCounts(
            int all,
            int applied,
            int reviewing,
            int interview,
            int accepted,
            int rejected,
            int withdrawn
    ) {}
}
