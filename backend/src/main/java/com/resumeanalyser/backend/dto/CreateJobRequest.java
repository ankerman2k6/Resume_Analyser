package com.resumeanalyser.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.resumeanalyser.backend.model.Job;

public record CreateJobRequest(
        String companyId,
        String title,
        String description,
        String category,
        String employmentType,
        Job.Location location,
        Job.Salary salary,
        Job.Experience experience,
        Map<String, Object> requirements,
        List<String> benefits,
        Instant deadline
) {}