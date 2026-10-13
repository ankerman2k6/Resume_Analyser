package com.resumeanalyser.backend.service;

import java.util.Map;

import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.resumeanalyser.backend.dto.DashboardOverviewResponse;
import com.resumeanalyser.backend.dto.DashboardStatusStatsResponse;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.DashboardRepository;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    private ObjectId getRecruiterId(User recruiter) {

        if (recruiter == null
                || recruiter.getId() == null
                || !ObjectId.isValid(recruiter.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid recruiter"
            );
        }

        return new ObjectId(recruiter.getId());
    }

    private long getCount(Map<String, Long> stats, String status) {
        return stats.getOrDefault(status, 0L);
    }

    private long getTotal(Map<String, Long> stats) {
        return stats.values()
                .stream()
                .mapToLong(Long::longValue)
                .sum();
    }

    // ============================
    // DASHBOARD OVERVIEW
    // ============================

    public DashboardOverviewResponse getOverview(User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        long totalJobs = dashboardRepository.countJobs(recruiterId);

        Map<String, Long> jobStats =
                dashboardRepository.countJobsByStatus(recruiterId);

        Map<String, Long> applicationStats =
                dashboardRepository.countApplicationsByStatus(recruiterId);

        Map<String, Long> interviewStats =
                dashboardRepository.countInterviewsByStatus(recruiterId);

        return new DashboardOverviewResponse(
                totalJobs,
                getCount(jobStats, "published"),
                getCount(jobStats, "draft"),
                getCount(jobStats, "closed"),
                getTotal(applicationStats),
                getTotal(interviewStats),
                getCount(interviewStats, "scheduled"),
                getCount(interviewStats, "completed"),
                getCount(interviewStats, "cancelled")
        );
    }

    // ============================
    // APPLICATION STATS
    // ============================

    public DashboardStatusStatsResponse getApplicationStats(
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        Map<String, Long> stats =
                dashboardRepository.countApplicationsByStatus(recruiterId);

        return new DashboardStatusStatsResponse(
                getTotal(stats),
                stats
        );
    }

    // ============================
    // INTERVIEW STATS
    // ============================

    public DashboardStatusStatsResponse getInterviewStats(
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        Map<String, Long> stats =
                dashboardRepository.countInterviewsByStatus(recruiterId);

        return new DashboardStatusStatsResponse(
                getTotal(stats),
                stats
        );
    }
}