package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import com.mongodb.client.MongoCollection;
import com.resumeanalyser.backend.dto.HrDashboardResponse;

class HrDashboardServiceTest {

    private MongoTemplate mongoTemplate;
    private HrDashboardService service;

    @BeforeEach
    void setUp() {
        mongoTemplate = mock(MongoTemplate.class);
        service = new HrDashboardService(mongoTemplate);
    }

    @Test
    void getDashboard_shouldMapAggregatedDatabaseResults() {
        AggregationResults<Document> jobCategories = results(
                new Document("name", "Backend Development").append("count", 3L),
                new Document("name", "Frontend Development").append("count", 2L));
        AggregationResults<Document> monthlyApplications = results(
                new Document("month", "2026-10").append("applicants", 4L));
        AggregationResults<Document> uniqueCandidates = results(
                new Document("_id", "candidate-1"),
                new Document("_id", "candidate-2"));
        MongoCollection<Document> applicationsCollection = mock(MongoCollection.class);

        when(mongoTemplate.aggregate(any(Aggregation.class), eq("jobs"), eq(Document.class)))
                .thenReturn(jobCategories);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("applications"), eq(Document.class)))
                .thenReturn(monthlyApplications, uniqueCandidates);
        when(mongoTemplate.getCollection("applications")).thenReturn(applicationsCollection);
        when(applicationsCollection.countDocuments()).thenReturn(4L);

        HrDashboardResponse response = service.getDashboard();

        assertEquals(5L, response.getTotalOpenJobs());
        assertEquals(4L, response.getTotalApplications());
        assertEquals(2L, response.getInterestedCandidates());
        assertEquals(2, response.getJobsBySpecialty().size());
        assertEquals(response.getJobsBySpecialty().get(0).getCount(),
                response.getJobsByDivision().get(0).getCount());
        assertEquals("10/2026", response.getCandidateInterestTrend().get(0).getMonth());
        assertEquals(4L, response.getCandidateInterestTrend().get(0).getApplicants());
    }

    private AggregationResults<Document> results(Document... documents) {
        return new AggregationResults<>(List.of(documents), new Document());
    }
}
