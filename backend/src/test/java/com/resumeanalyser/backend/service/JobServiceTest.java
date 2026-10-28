package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.web.server.ResponseStatusException;

import com.resumeanalyser.backend.dto.CreateJobRequest;
import com.resumeanalyser.backend.dto.JobResponse;
import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.JobRepository;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private RecruiterIdentityService recruiterIdentity;

    private JobService jobService;

    @BeforeEach
    void setUp() {
        jobService = new JobService(jobRepository, mongoTemplate, recruiterIdentity);
    }

    @Test
    void searchJobs_shouldReturnPagedResults() {
        Job sampleJob = new Job();
        sampleJob.setId(new ObjectId());
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
        ObjectId id = new ObjectId();
        job.setId(id);
        job.setCompanyId(new ObjectId());
        job.setRecruiterId(new ObjectId());
        job.setTitle("Frontend Dev");
        job.setStatus("published");
        job.setDeadline(Instant.parse("2030-01-01T12:00:00Z"));
        job.setCreatedAt(Instant.parse("2026-01-01T12:00:00Z"));
        job.setRequirements(Map.of("requiredSkills", List.of("Java"),
                "education", Map.of("minimumDegree", "bachelor"),
                "minimumGpa", Map.of("value", 3, "scale", 4),
                "languages", List.of(Map.of("name", "English"))));

        when(jobRepository.findById(id)).thenReturn(Optional.of(job));

        JobResponse response = jobService.getJobById(id.toHexString());

        assertNotNull(response);
        assertEquals(id.toHexString(), response.getId());
        assertEquals(job.getCompanyId().toHexString(), response.getCompanyId());
        assertEquals(job.getRecruiterId().toHexString(), response.getRecruiterId());
        assertEquals(job.getRequirements(), response.getRequirements());
        assertEquals(LocalDateTime.of(2030, 1, 1, 12, 0), response.getDeadline());
        assertEquals(LocalDateTime.of(2026, 1, 1, 12, 0), response.getCreatedAt());
        assertEquals("Frontend Dev", response.getTitle());
    }

    @Test
    void getJobById_notFoundThrowsException() {
        ObjectId id = new ObjectId();
        when(jobRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> jobService.getJobById(id.toHexString()));
    }

    @Test
    void getJobById_invalidIdIsRejectedBeforeRepositoryLookup() {
        assertThrows(BadRequestException.class, () -> jobService.getJobById("unknown"));
        assertThrows(BadRequestException.class, () -> jobService.getJobById(null));
        verify(jobRepository, never()).findById(any(ObjectId.class));
    }

    @Test
    void publicJobDetailsNeverReturnUnpublishedJobs() {
        Job job = new Job();
        job.setId(new ObjectId());
        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        for (String status : new String[]{"draft", "closed", "expired", null}) {
            job.setStatus(status);
            assertThrows(BadRequestException.class, () -> jobService.getJobById(job.getId().toHexString()));
        }
    }

    @Test
    void searchJobs_keepsPublishedFilterEscapesRegexAndAppliesPagination() {
        when(mongoTemplate.count(any(Query.class), eq(Job.class))).thenReturn(0L);
        when(mongoTemplate.find(any(Query.class), eq(Job.class))).thenReturn(List.of());

        PageResponse<JobResponse> response = jobService.searchJobs(" Java.* ", "Backend", " remote ", -1, 200);

        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(query.capture(), eq(Job.class));
        String criteria = query.getValue().getQueryObject().toJson();
        assertTrue(criteria.contains("published"));
        assertTrue(criteria.contains("requirements.requiredSkills"));
        assertTrue(criteria.contains("requirements.preferredSkills"));
        assertTrue(criteria.contains("\\\\QJava.*\\\\E"));
        assertTrue(criteria.contains("location.remote"));
        assertEquals(100, query.getValue().getLimit());
        assertEquals(0, query.getValue().getSkip());
        assertEquals(-1, query.getValue().getSortObject().get("createdAt"));
        assertEquals(0, response.getPage());
        assertEquals(100, response.getSize());
        assertTrue(response.isLast());
    }

    @Test
    void hrCrudKeepsOwnershipAndRichRequirements() {
        User recruiter = new User();
        recruiter.setId(new ObjectId().toHexString());
        ObjectId companyId = new ObjectId();
        ObjectId owner = new ObjectId();
        RecruiterProfile profile = new RecruiterProfile();
        profile.setId(owner);
        profile.setUserId(new ObjectId(recruiter.getId()));
        profile.setCompanyId(companyId);
        Map<String, Object> requirements = Map.of("requiredSkills", List.of("Java"),
                "education", Map.of("minimumDegree", "bachelor"));
        CreateJobRequest request = new CreateJobRequest(companyId.toHexString(), "Backend", "Description", "IT",
                "full_time", new Job.Location("Address", "City", "Country", false),
                new Job.Salary(100L, 200L, "USD", true), new Job.Experience(1, 3, "junior"),
                requirements, List.of("Training"), Instant.now().plusSeconds(86400));
        when(recruiterIdentity.requireProfile(recruiter)).thenReturn(profile);
        when(recruiterIdentity.requireProfileId(recruiter)).thenReturn(owner);
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Job created = jobService.createJob(request, recruiter);
        created.setId(new ObjectId());
        when(jobRepository.findByIdAndRecruiterId(created.getId(), owner)).thenReturn(Optional.of(created));
        when(jobRepository.findByRecruiterId(owner)).thenReturn(List.of(created));

        assertEquals(companyId, created.getCompanyId());
        assertEquals(owner, created.getRecruiterId());
        assertEquals("draft", created.getStatus());
        assertEquals(requirements, created.getRequirements());
        assertEquals(List.of(created), jobService.getMyJobs(recruiter));
        assertEquals(created, jobService.getJobById(created.getId().toHexString(), recruiter));
        Instant createdAt = created.getCreatedAt();
        jobService.updateJob(created.getId().toHexString(), request, recruiter);
        assertEquals(createdAt, created.getCreatedAt());
        assertEquals(owner, created.getRecruiterId());
        assertEquals(companyId, created.getCompanyId());
        assertEquals("published", jobService.updateJobStatus(created.getId().toHexString(), "published", recruiter).getStatus());
        jobService.deleteJob(created.getId().toHexString(), recruiter);
        verify(jobRepository).delete(created);
    }

    @Test
    void hrCannotReadUpdateOrDeleteAnotherRecruitersJob() {
        User recruiter = new User();
        recruiter.setId(new ObjectId().toHexString());
        ObjectId owner = new ObjectId();
        ObjectId jobId = new ObjectId();
        when(recruiterIdentity.requireProfileId(recruiter)).thenReturn(owner);
        when(jobRepository.findByIdAndRecruiterId(jobId, owner))
                .thenReturn(Optional.empty());

        assertEquals(404, assertThrows(ResponseStatusException.class,
                () -> jobService.getJobById(jobId.toHexString(), recruiter)).getStatusCode().value());
        assertThrows(ResponseStatusException.class, () -> jobService.updateJob(jobId.toHexString(), null, recruiter));
        assertThrows(ResponseStatusException.class, () -> jobService.updateJobStatus(jobId.toHexString(), "published", recruiter));
        assertThrows(ResponseStatusException.class, () -> jobService.deleteJob(jobId.toHexString(), recruiter));
        verify(jobRepository, never()).save(any(Job.class));
        verify(jobRepository, never()).delete(any(Job.class));
    }
}
