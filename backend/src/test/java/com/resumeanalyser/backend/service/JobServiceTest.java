package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import com.resumeanalyser.backend.dto.JobResponse;
import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.repository.JobRepository;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    private JobService jobService;

    @BeforeEach
    void setUp() {
        jobService = new JobService(jobRepository, mongoTemplate);
    }

    @Test
    void searchJobs_shouldReturnPagedResults() {
        Job sampleJob = new Job();
        sampleJob.setId("job1");
        sampleJob.setTitle("Backend Engineer");
        sampleJob.setDescription("Spring Boot development");
        sampleJob.setCategory("Backend Development");
        sampleJob.setLocation(new Job.Location("Cầu Giấy", "Hà Nội", "Việt Nam", false));
        sampleJob.setStatus("published");

        when(mongoTemplate.count(any(Query.class), eq(Job.class))).thenReturn(1L);
        when(mongoTemplate.find(any(Query.class), eq(Job.class))).thenReturn(List.of(sampleJob));

        PageResponse<JobResponse> result = jobService.searchJobs("Java", "Backend Development", "Hà Nội", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("Backend Engineer", result.getContent().get(0).getTitle());
        assertFalse(result.getContent().isEmpty());
    }

    @Test
    void getJobById_success() {
        Job job = new Job();
        job.setId("job123");
        job.setTitle("Frontend Dev");

        when(jobRepository.findById("job123")).thenReturn(Optional.of(job));

        JobResponse response = jobService.getJobById("job123");

        assertNotNull(response);
        assertEquals("job123", response.getId());
        assertEquals("Frontend Dev", response.getTitle());
    }

    @Test
    void getJobById_notFoundThrowsException() {
        when(jobRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> jobService.getJobById("unknown"));
    }
}
