package com.resumeanalyser.backend.repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Repository
public class DashboardRepositoryImpl implements DashboardRepository {

    private final MongoTemplate mongoTemplate;

    public DashboardRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    // ============================
    // COUNT JOBS
    // ============================

    @Override
    public long countJobs(ObjectId recruiterId) {

        return mongoTemplate.count(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("recruiterId").is(recruiterId)
                ),
                "jobs"
        );
    }

    // ============================
    // GROUP BY STATUS HELPER
    // ============================

    private Map<String, Long> aggregateStatuses(
            Aggregation aggregation,
            String collection) {

        AggregationResults<Document> results =
                mongoTemplate.aggregate(
                        aggregation,
                        collection,
                        Document.class
                );

        Map<String, Long> stats = new LinkedHashMap<>();

        for (Document document : results.getMappedResults()) {

            Object statusValue = document.get("_id");
            String status = statusValue == null
                    ? "unknown"
                    : statusValue.toString();

            Number count = (Number) document.get("count");

            stats.put(
                    status,
                    count == null ? 0L : count.longValue()
            );
        }

        return stats;
    }

    // ============================
    // JOB STATUS
    // ============================

    @Override
    public Map<String, Long> countJobsByStatus(ObjectId recruiterId) {

        Aggregation aggregation = newAggregation(
                match(Criteria.where("recruiterId").is(recruiterId)),
                group("status").count().as("count")
        );

        return aggregateStatuses(aggregation, "jobs");
    }

    // ============================
    // APPLICATION STATUS
    // ============================

    @Override
    public Map<String, Long> countApplicationsByStatus(
            ObjectId recruiterId) {

        // Lấy Job thuộc HR bằng MongoDB Aggregation
        Aggregation jobAggregation = newAggregation(
                match(Criteria.where("recruiterId").is(recruiterId)),
                project("_id")
        );

        List<ObjectId> jobIds = mongoTemplate.aggregate(
                jobAggregation,
                "jobs",
                Document.class
        ).getMappedResults()
         .stream()
         .map(doc -> doc.getObjectId("_id"))
         .toList();

        if (jobIds.isEmpty()) {
            return Map.of();
        }

        Aggregation aggregation = newAggregation(
                match(Criteria.where("jobId").in(jobIds)),
                group("status").count().as("count")
        );

        return aggregateStatuses(aggregation, "applications");
    }

    // ============================
    // INTERVIEW STATUS
    // ============================

    @Override
    public Map<String, Long> countInterviewsByStatus(
            ObjectId recruiterId) {

        // Lấy danh sách Job của HR
        List<ObjectId> jobIds = mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("recruiterId").is(recruiterId)
                ),
                com.resumeanalyser.backend.model.Job.class
        ).stream()
         .map(com.resumeanalyser.backend.model.Job::getId)
         .toList();

        if (jobIds.isEmpty()) {
            return Map.of();
        }

        // Lấy Application thuộc các Job đó
        List<ObjectId> applicationIds = mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("jobId").in(jobIds)
                ),
                com.resumeanalyser.backend.model.Application.class
        ).stream()
         .map(com.resumeanalyser.backend.model.Application::getId)
         .toList();

        if (applicationIds.isEmpty()) {
            return Map.of();
        }

        // Chỉ thống kê Interview thuộc Application của HR
        // và do chính HR đó tạo lịch.
        Aggregation aggregation = newAggregation(
                match(
                        new Criteria().andOperator(
                                Criteria.where("applicationId")
                                        .in(applicationIds),
                                Criteria.where("scheduledBy")
                                        .is(recruiterId)
                        )
                ),
                group("status").count().as("count")
        );

        return aggregateStatuses(aggregation, "interviews");
    }
}