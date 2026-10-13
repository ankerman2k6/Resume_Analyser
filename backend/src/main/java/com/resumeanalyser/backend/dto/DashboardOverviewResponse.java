package com.resumeanalyser.backend.dto;

import com.resumeanalyser.backend.dto.DashboardOverviewResponse;
import com.resumeanalyser.backend.dto.DashboardStatusStatsResponse;

public record DashboardOverviewResponse(
        long totalJobs,
        long publishedJobs,
        long draftJobs,
        long closedJobs,
        long totalApplications,
        long totalInterviews,
        long scheduledInterviews,
        long completedInterviews,
        long cancelledInterviews
) {}