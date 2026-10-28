package com.resumeanalyser.backend.service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.HrDashboardResponse;
import com.resumeanalyser.backend.dto.HrDashboardResponse.CategoryCount;
import com.resumeanalyser.backend.dto.HrDashboardResponse.MonthlyApplicationCount;

@Service
public class HrDashboardService {

    private static final DateTimeFormatter MONTH_BUCKET_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter MONTH_DISPLAY_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private final MongoTemplate mongoTemplate;

    public HrDashboardService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public HrDashboardResponse getDashboard() {
        List<CategoryCount> jobsByCategory = aggregateJobCategories();
        List<MonthlyApplicationCount> interestTrend = aggregateMonthlyApplications();
        long totalOpenJobs = jobsByCategory.stream().mapToLong(CategoryCount::getCount).sum();
        long totalApplications = mongoTemplate.getCollection("applications").countDocuments();
        long interestedCandidates = countUniqueCandidates();

        return new HrDashboardResponse(
                totalOpenJobs,
                totalApplications,
                interestedCandidates,
                jobsByCategory,
                new ArrayList<>(jobsByCategory),
                interestTrend
        );
    }

    private List<CategoryCount> aggregateJobCategories() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("status").is("published")),
                Aggregation.group("category").count().as("count"),
                Aggregation.project("count").and("_id").as("name"),
                Aggregation.sort(Sort.Direction.DESC, "count")
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(aggregation, "jobs", Document.class);
        return results.getMappedResults().stream()
                .map(row -> new CategoryCount(
                        row.getString("name") == null ? "Chưa phân loại" : row.getString("name"),
                        ((Number) row.get("count")).longValue()))
                .toList();
    }

    private List<MonthlyApplicationCount> aggregateMonthlyApplications() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.project()
                        .andExpression("dateToString('%Y-%m', $appliedAt)").as("month"),
                Aggregation.match(Criteria.where("month").ne(null)),
                Aggregation.group("month").count().as("applicants"),
                Aggregation.project("applicants").and("_id").as("month"),
                Aggregation.sort(Sort.Direction.ASC, "month")
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(aggregation, "applications", Document.class);
        Map<YearMonth, Long> counts = new LinkedHashMap<>();
        for (Document row : results.getMappedResults()) {
            String month = row.getString("month");
            if (month != null) {
                counts.put(YearMonth.parse(month, MONTH_BUCKET_FORMAT),
                        ((Number) row.get("applicants")).longValue());
            }
        }

        return counts.entrySet().stream()
                .map(entry -> new MonthlyApplicationCount(
                        entry.getKey().format(MONTH_DISPLAY_FORMAT),
                        entry.getValue()))
                .toList();
    }

    private long countUniqueCandidates() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.group("candidateId")
        );
        return mongoTemplate.aggregate(aggregation, "applications", Document.class)
                .getMappedResults()
                .size();
    }
}
