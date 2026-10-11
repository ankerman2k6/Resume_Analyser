package com.resumeanalyser.backend.repository;

import java.util.Map;

import org.bson.types.ObjectId;

public interface DashboardRepository {

    long countJobs(ObjectId recruiterId);

    Map<String, Long> countJobsByStatus(ObjectId recruiterId);

    Map<String, Long> countApplicationsByStatus(ObjectId recruiterId);

    Map<String, Long> countInterviewsByStatus(ObjectId recruiterId);
}