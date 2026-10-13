package com.resumeanalyser.backend.dto;

import java.util.Map;

public record DashboardStatusStatsResponse(
        long total,
        Map<String, Long> byStatus
) {}