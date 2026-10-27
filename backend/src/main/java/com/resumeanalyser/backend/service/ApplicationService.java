package com.resumeanalyser.backend.service;

import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.repository.ApplicationRepository;
import com.resumeanalyser.backend.repository.JobRepository;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {
    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "pending", "reviewing", "shortlisted", "interview", "accepted", "rejected");
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final RecruiterIdentityService recruiterIdentity;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            RecruiterIdentityService recruiterIdentity) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.recruiterIdentity = recruiterIdentity;
    }

    public List<Application> getApplicationsByJob(String jobId, String recruiterUserId) {
        ObjectId id = resourceId(jobId, "Job");
        ObjectId recruiterProfileId = recruiterIdentity.requireProfileId(recruiterUserId);
        requireOwnedJob(id, recruiterProfileId);
        return applicationRepository.findByJobId(id);
    }

    public Application updateStatus(String applicationId, String newStatus, String recruiterUserId) {
        ObjectId id = resourceId(applicationId, "Application");
        if (newStatus == null || !ALLOWED_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid application status");
        }
        ObjectId recruiterProfileId = recruiterIdentity.requireProfileId(recruiterUserId);
        ObjectId changedByUserId = recruiterIdentity.requireUserId(recruiterUserId);
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found"));
        if (application.getJobId() == null) {
            throw new NotFoundException("Application job not found");
        }
        requireOwnedJob(application.getJobId(), recruiterProfileId);
        // Atomic field update preserves unknown document fields and appends history without lost updates.
        return applicationRepository.updateStatus(
                        id,
                        application.getJobId(),
                        newStatus,
                        Instant.now(),
                        changedByUserId)
                .orElseThrow(() -> new NotFoundException("Application not found"));
    }

    private void requireOwnedJob(ObjectId id, ObjectId recruiter) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new NotFoundException("Job not found"));
        if (!recruiter.equals(job.getRecruiterId())) {
            throw new ForbiddenException("You cannot manage applications for this job");
        }
    }

    private static ObjectId resourceId(String value, String resource) {
        if (value == null || !ObjectId.isValid(value)) {
            throw new IllegalArgumentException(resource + " ID is invalid");
        }
        return new ObjectId(value);
    }
}
