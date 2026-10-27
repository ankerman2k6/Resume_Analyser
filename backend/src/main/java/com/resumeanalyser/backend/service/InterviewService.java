package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.resumeanalyser.backend.dto.CreateInterviewRequest;
import com.resumeanalyser.backend.dto.InterviewResponse;
import com.resumeanalyser.backend.dto.UpdateInterviewRequest;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.Interview;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.ApplicationRepository;
import com.resumeanalyser.backend.repository.InterviewRepository;
import com.resumeanalyser.backend.repository.JobRepository;

@Service
public class InterviewService {

    private static final Set<String> MODES =
            Set.of("online", "offline");

    private static final Set<String> STATUSES =
            Set.of("scheduled", "completed", "cancelled");

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final RecruiterIdentityService recruiterIdentity;

    public InterviewService(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            RecruiterIdentityService recruiterIdentity) {

        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.recruiterIdentity = recruiterIdentity;
    }

    // =========================
    // HELPER
    // =========================

    private ObjectId parseId(String id) {
        if (id == null || !ObjectId.isValid(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid ObjectId"
            );
        }

        return new ObjectId(id);
    }

    private ObjectId getRecruiterId(User recruiter) {
        return recruiterIdentity.requireProfileId(recruiter);
    }

    private Application getOwnedApplication(
            String applicationId,
            ObjectId recruiterId) {

        Application application = applicationRepository
                .findById(parseId(applicationId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Application not found"
                ));

        Job job = jobRepository
                .findById(application.getJobId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found"
                ));

        if (!recruiterId.equals(job.getRecruiterId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Application not found"
            );
        }

        return application;
    }

    private Interview getOwnedInterview(
            String interviewId,
            ObjectId recruiterId) {

        Interview interview = interviewRepository
                .findByIdAndScheduledBy(
                        parseId(interviewId),
                        recruiterId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Interview not found"
                ));

        // Kiểm tra cả quyền sở hữu Job liên quan.
        // Không chỉ tin vào scheduledBy.
        getOwnedApplication(
                interview.getApplicationId().toHexString(),
                recruiterId
        );

        return interview;
    }

    private void validateSchedule(
            Instant scheduledAt,
            Integer durationMinutes,
            String mode,
            String meetingLink,
            String location) {

        if (scheduledAt == null ||
                !scheduledAt.isAfter(Instant.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Interview time must be in the future"
            );
        }

        if (durationMinutes == null ||
                durationMinutes <= 0 ||
                durationMinutes > 480) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Duration must be between 1 and 480 minutes"
            );
        }

        if (mode == null || !MODES.contains(mode)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mode must be online or offline"
            );
        }

        if ("online".equals(mode) &&
                (meetingLink == null || meetingLink.isBlank())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Meeting link is required for online interview"
            );
        }

        if ("offline".equals(mode) &&
                (location == null || location.isBlank())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Location is required for offline interview"
            );
        }
    }

    // =========================
    // CREATE
    // =========================

    public InterviewResponse createInterview(
            CreateInterviewRequest request,
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body is required"
            );
        }

        Application application = getOwnedApplication(
                request.applicationId(),
                recruiterId
        );

        validateSchedule(
                request.scheduledAt(),
                request.durationMinutes(),
                request.mode(),
                request.meetingLink(),
                request.location()
        );

        Interview interview = new Interview();

        interview.setApplicationId(application.getId());
        interview.setScheduledBy(recruiterId);
        interview.setScheduledAt(request.scheduledAt());
        interview.setDurationMinutes(request.durationMinutes());
        interview.setMode(request.mode());
        interview.setMeetingLink(request.meetingLink());
        interview.setLocation(request.location());
        interview.setNotes(request.notes());
        interview.setStatus("scheduled");
        interview.setCreatedAt(Instant.now());

        return InterviewResponse.from(
                interviewRepository.save(interview)
        );
    }

    // =========================
    // GET ALL
    // =========================

    public List<InterviewResponse> getMyInterviews(
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        return interviewRepository
                .findByScheduledByOrderByScheduledAtDesc(recruiterId)
                .stream()
                .filter(interview -> {
                    try {
                        getOwnedApplication(
                                interview.getApplicationId().toHexString(),
                                recruiterId
                        );
                        return true;
                    } catch (ResponseStatusException ex) {
                        if (ex.getStatusCode().value() == 404) {
                            return false;
                        }
                        throw ex;
                    }
                })
                .map(InterviewResponse::from)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================

    public InterviewResponse getInterviewById(
            String interviewId,
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        return InterviewResponse.from(
                getOwnedInterview(interviewId, recruiterId)
        );
    }

    // =========================
    // GET APPLICATION HISTORY
    // =========================

    public List<InterviewResponse> getApplicationInterviews(
            String applicationId,
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        Application application = getOwnedApplication(
                applicationId,
                recruiterId
        );

        return interviewRepository
                .findByApplicationIdAndScheduledByOrderByScheduledAtDesc(
                        application.getId(),
                        recruiterId
                )
                .stream()
                .map(InterviewResponse::from)
                .toList();
    }

    // =========================
    // UPDATE
    // =========================

    public InterviewResponse updateInterview(
            String interviewId,
            UpdateInterviewRequest request,
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        Interview interview = getOwnedInterview(
                interviewId,
                recruiterId
        );

        if (!"scheduled".equals(interview.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only scheduled interviews can be updated"
            );
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body is required"
            );
        }

        validateSchedule(
                request.scheduledAt(),
                request.durationMinutes(),
                request.mode(),
                request.meetingLink(),
                request.location()
        );

        interview.setScheduledAt(request.scheduledAt());
        interview.setDurationMinutes(request.durationMinutes());
        interview.setMode(request.mode());
        interview.setMeetingLink(request.meetingLink());
        interview.setLocation(request.location());
        interview.setNotes(request.notes());

        return InterviewResponse.from(
                interviewRepository.save(interview)
        );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    public InterviewResponse updateInterviewStatus(
            String interviewId,
            String newStatus,
            User recruiter) {

        ObjectId recruiterId = getRecruiterId(recruiter);

        if (newStatus == null ||
                !STATUSES.contains(newStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid interview status"
            );
        }

        Interview interview = getOwnedInterview(
                interviewId,
                recruiterId
        );

        if (!"scheduled".equals(interview.getStatus())
                && !interview.getStatus().equals(newStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Interview is already finalized"
            );
        }

        interview.setStatus(newStatus);

        return InterviewResponse.from(
                interviewRepository.save(interview)
        );
    }
}
