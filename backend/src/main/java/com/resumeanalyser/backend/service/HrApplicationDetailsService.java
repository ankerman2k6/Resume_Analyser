package com.resumeanalyser.backend.service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.nio.file.*;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.resumeanalyser.backend.dto.HrApplicationResponse;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.*;
import com.resumeanalyser.backend.repository.*;

@Service
public class HrApplicationDetailsService {
    private final ApplicationService applications;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository profiles;
    private final UserRepository users;
    private final CvRepository cvs;
    private final Path uploadRoot;

    public HrApplicationDetailsService(ApplicationService applications,
            ApplicationRepository applicationRepository, CandidateProfileRepository profiles,
            UserRepository users, CvRepository cvs,
            @Value("${app.upload.dir:uploads/resumes}") String uploadDir) {
        this.applications = applications;
        this.applicationRepository = applicationRepository;
        this.profiles = profiles;
        this.users = users;
        this.cvs = cvs;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    // ApplicationService checks job ownership before any candidate information is loaded.
    public List<HrApplicationResponse> getByJob(String jobId, String recruiterId) {
        List<Application> rows = applications.getApplicationsByJob(jobId, recruiterId);
        Set<ObjectId> profileIds = rows.stream().map(Application::getCandidateId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Set<ObjectId> cvIds = rows.stream().map(Application::getCvId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Map<ObjectId, CandidateProfile> profileMap = profiles.findAllById(profileIds).stream()
                .collect(Collectors.toMap(CandidateProfile::getId, Function.identity()));
        Map<String, User> userMap = users.findAllById(profileMap.values().stream()
                .map(CandidateProfile::getUserId).filter(Objects::nonNull)
                .map(ObjectId::toHexString).toList()).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<ObjectId, Cv> cvMap = cvs.findAllById(cvIds).stream()
                .collect(Collectors.toMap(Cv::getId, Function.identity()));
        return rows.stream().map(app -> {
            CandidateProfile profile = profileMap.get(app.getCandidateId());
            User user = profile == null || profile.getUserId() == null ? null
                    : userMap.get(profile.getUserId().toHexString());
            Cv cv = cvMap.get(app.getCvId());
            if (cv != null && !Objects.equals(app.getCandidateId(), cv.getCandidateId())) cv = null;
            Map<String, Object> personal = cv == null || cv.getPersonalInfo() == null
                    ? Map.of() : cv.getPersonalInfo();
            String cvUrl = cv != null && cv.getSource() != null
                    && text(cv.getSource().getFileUrl()) != null
                    ? "/api/hr/applications/" + hex(app.getId()) + "/cv/file" : null;
            return new HrApplicationResponse(hex(app.getId()), hex(app.getJobId()),
                    hex(app.getCandidateId()), hex(app.getCvId()),
                    first(profile == null ? null : profile.getFullName(), personal.get("fullName")),
                    first(user == null ? null : user.getEmail(), personal.get("email")),
                    first(profile == null ? null : profile.getPhone(), personal.get("phone")),
                    cvUrl, app.getStatus(), app.getAppliedAt(), app.getUpdatedAt(), app.getStatusHistory());
        }).toList();
    }
    

    public Path getCvFile(String id, String recruiterId) {
        if (id == null || !ObjectId.isValid(id)) throw new IllegalArgumentException("Application ID is invalid");
        Application app = applicationRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new NotFoundException("Application not found"));
        if (app.getJobId() == null) throw new NotFoundException("Application job not found");
        applications.getApplicationsByJob(app.getJobId().toHexString(), recruiterId);
        if (app.getCvId() == null || app.getCandidateId() == null) throw new NotFoundException("CV not found");
        Cv cv = cvs.findByIdAndCandidateId(app.getCvId(), app.getCandidateId())
                .orElseThrow(() -> new NotFoundException("CV not found"));
        if (cv.getSource() == null || text(cv.getSource().getFileUrl()) == null)
            throw new NotFoundException("CV file not found");
        try {
            Path root = uploadRoot.toRealPath();
            Path file = Paths.get(cv.getSource().getFileUrl()).toAbsolutePath().normalize().toRealPath();
            if (!file.startsWith(root) || !Files.isRegularFile(file)) throw new NotFoundException("CV file not found");
            return file;
        } catch (java.io.IOException | java.nio.file.InvalidPathException ex) {
            throw new NotFoundException("CV file not found");
        }
    }

    private static String hex(ObjectId id) { return id == null ? null : id.toHexString(); }
    private static String text(Object value) {
        return value instanceof String s && !s.isBlank() ? s.trim() : null;
    }
    private static String first(Object primary, Object fallback) {
        return text(primary) != null ? text(primary) : text(fallback);
    }
}
