package com.resumeanalyser.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.candidate.CandidateApplicationDto;
import com.resumeanalyser.backend.dto.candidate.ApplyJobRequest;
import com.resumeanalyser.backend.dto.candidate.CareerDto;
import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest;
import com.resumeanalyser.backend.dto.candidate.CvSummaryDto;
import com.resumeanalyser.backend.dto.candidate.ProfileDto;
import com.resumeanalyser.backend.dto.candidate.StatsDto;
import com.resumeanalyser.backend.dto.candidate.UpdateProfileRequest;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.FileStorageException;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.exception.UnsupportedFileTypeException;
import com.resumeanalyser.backend.model.Application;
import com.resumeanalyser.backend.model.CandidateProfile;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.Cv;
import com.resumeanalyser.backend.model.CvAnalysis;
import com.resumeanalyser.backend.model.CvTemplate;
import com.resumeanalyser.backend.model.Interview;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.ApplicationRepository;
import com.resumeanalyser.backend.repository.CandidateProfileRepository;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.CvAnalysisRepository;
import com.resumeanalyser.backend.repository.CvRepository;
import com.resumeanalyser.backend.repository.InterviewRepository;
import com.resumeanalyser.backend.repository.JobRepository;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.service.ai.CvParsingService;

@Service
public class CandidateService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final int MAX_TEMPLATE_CV_TOTAL_CHARS = 100_000;
    private static final Set<String> ALLOWED_FILTERS = Set.of(
            "all", "applied", "reviewing", "interview", "accepted", "rejected", "withdrawn"
    );

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CvRepository cvRepository;
    private final CvAnalysisRepository cvAnalysisRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final JobRepository jobRepository;
    private final MongoTemplate mongoTemplate;
    private final CvParsingService cvParsingService;
    private final CvTemplateService cvTemplateService;
    private final CvTemplatePdfRenderer cvTemplatePdfRenderer;
    private final CvGridFsStorageService cvGridFsStorageService;
    private final Path uploadStorageLocation;

    public CandidateService(
            CandidateProfileRepository profileRepository,
            UserRepository userRepository,
            CvRepository cvRepository,
            CvAnalysisRepository cvAnalysisRepository,
            CompanyRepository companyRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            JobRepository jobRepository,
            MongoTemplate mongoTemplate,
            CvParsingService cvParsingService,
            CvTemplateService cvTemplateService,
            CvTemplatePdfRenderer cvTemplatePdfRenderer,
            CvGridFsStorageService cvGridFsStorageService,
            @Value("${app.upload.dir:uploads/resumes}") String uploadDir) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.cvRepository = cvRepository;
        this.cvAnalysisRepository = cvAnalysisRepository;
        this.companyRepository = companyRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.jobRepository = jobRepository;
        this.mongoTemplate = mongoTemplate;
        this.cvParsingService = cvParsingService;
        this.cvTemplateService = cvTemplateService;
        this.cvTemplatePdfRenderer = cvTemplatePdfRenderer;
        this.cvGridFsStorageService = cvGridFsStorageService;
        this.uploadStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Không thể khởi tạo thư mục lưu trữ file: " + uploadDir);
        }
    }

    public record SaveResult(ProfileDto dto, boolean created) {}
    public record CvFileInfo(Resource resource, String fileName, String mimeType) {
        public CvFileInfo(Path filePath, String fileName, String mimeType) {
            this(new FileSystemResource(filePath), fileName, mimeType);
        }
    }

    // -------------------------------------------------------------
    // Security / Resolution Helpers
    // -------------------------------------------------------------

    private void verifyCandidateAccess(User user) {
        if (user == null || !"candidate".equalsIgnoreCase(user.getRole()) || !"active".equalsIgnoreCase(user.getStatus())) {
            throw new ForbiddenException("FORBIDDEN", "Tài khoản không có quyền ứng viên hoặc không ở trạng thái hoạt động.");
        }
    }

    private ObjectId parseObjectId(String id, String fieldName) {
        if (id == null || !ObjectId.isValid(id)) {
            throw new BadRequestException("VALIDATION_ERROR", fieldName + " không hợp lệ.");
        }
        return new ObjectId(id);
    }

    private CandidateProfile requireProfile(User user) {
        verifyCandidateAccess(user);
        ObjectId userObjectId = parseObjectId(user.getId(), "userId");
        return profileRepository.findByUserId(userObjectId)
                .orElseThrow(() -> new NotFoundException("PROFILE_NOT_FOUND", "Chưa tạo hồ sơ ứng viên."));
    }

    private CandidateProfile resolveProfile(User user) {
        verifyCandidateAccess(user);
        ObjectId userObjectId = parseObjectId(user.getId(), "userId");
        return profileRepository.findByUserId(userObjectId).orElse(null);
    }

    private String nullIfBlank(String str) {
        return (str == null || str.isBlank()) ? null : str;
    }

    // -------------------------------------------------------------
    // 1. Profile: GET and PUT
    // -------------------------------------------------------------

    public ProfileDto getProfile(User user) {
        CandidateProfile profile = requireProfile(user);
        return mapToProfileDto(profile, user);
    }

    public SaveResult saveProfile(User user, UpdateProfileRequest request) {
        verifyCandidateAccess(user);
        ObjectId userObjectId = parseObjectId(user.getId(), "userId");

        String fullName = request.getFullName().trim();
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String city = request.getLocation() != null && request.getLocation().getCity() != null
                ? request.getLocation().getCity().trim() : "";
        String country = request.getLocation() != null && request.getLocation().getCountry() != null
                ? request.getLocation().getCountry().trim() : "";

        Optional<CandidateProfile> existingOpt = profileRepository.findByUserId(userObjectId);
        Instant now = Instant.now();

        if (existingOpt.isPresent()) {
            CandidateProfile existing = existingOpt.get();
            existing.setFullName(fullName);
            existing.setPhone(phone);
            existing.setLocation(new CandidateProfile.Location(city, country));
            existing.setUpdatedAt(now);
            CandidateProfile saved = profileRepository.save(existing);
            return new SaveResult(mapToProfileDto(saved, user), false);
        } else {
            CandidateProfile newProfile = new CandidateProfile();
            newProfile.setId(new ObjectId());
            newProfile.setUserId(userObjectId);
            newProfile.setFullName(fullName);
            newProfile.setPhone(phone);
            newProfile.setAvatarUrl("");
            newProfile.setLocation(new CandidateProfile.Location(city, country));
            newProfile.setCreatedAt(now);
            newProfile.setUpdatedAt(now);

            try {
                CandidateProfile saved = profileRepository.save(newProfile);
                return new SaveResult(mapToProfileDto(saved, user), true);
            } catch (DuplicateKeyException ex) {
                // Concurrently created by another request, fall back to update
                CandidateProfile fallback = profileRepository.findByUserId(userObjectId)
                        .orElseThrow(() -> new ConflictException("Lỗi cập nhật hồ sơ đồng thời."));
                fallback.setFullName(fullName);
                fallback.setPhone(phone);
                fallback.setLocation(new CandidateProfile.Location(city, country));
                fallback.setUpdatedAt(Instant.now());
                CandidateProfile saved = profileRepository.save(fallback);
                return new SaveResult(mapToProfileDto(saved, user), false);
            }
        }
    }

    private ProfileDto mapToProfileDto(CandidateProfile profile, User user) {
        String city = null;
        String country = null;
        if (profile.getLocation() != null) {
            city = nullIfBlank(profile.getLocation().getCity());
            country = nullIfBlank(profile.getLocation().getCountry());
        }
        return new ProfileDto(
                profile.getId().toHexString(),
                profile.getUserId().toHexString(),
                nullIfBlank(profile.getFullName()),
                user.getEmail(),
                nullIfBlank(profile.getPhone()),
                nullIfBlank(profile.getAvatarUrl()),
                new ProfileDto.LocationDto(city, country),
                user.getStatus(),
                user.isEmailVerified(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    // -------------------------------------------------------------
    // 2. Stats: GET
    // -------------------------------------------------------------

    public StatsDto getStats(User user) {
        CandidateProfile profile = resolveProfile(user);
        if (profile == null) {
            return new StatsDto(
                    0, 0, 0, null, 0,
                    new StatsDto.ApplicationCounts(0, 0, 0, 0, 0, 0, 0)
            );
        }

        ObjectId candidateId = profile.getId();
        int cvCount = (int) cvRepository.countByCandidateId(candidateId);

        List<Application> applications = applicationRepository.findByCandidateId(candidateId);
        int all = applications.size();
        int applied = 0;
        int reviewing = 0;
        int interview = 0;
        int accepted = 0;
        int rejected = 0;
        int withdrawn = 0;

        List<ObjectId> activeApplicationIds = new ArrayList<>();
        List<Application> nonWithdrawnApps = new ArrayList<>();

        for (Application app : applications) {
            String status = app.getStatus() != null ? app.getStatus() : "";
            switch (status) {
                case "applied" -> applied++;
                case "reviewing", "shortlisted" -> reviewing++;
                case "interview", "interview_scheduled" -> interview++;
                case "accepted" -> accepted++;
                case "rejected" -> rejected++;
                case "withdrawn" -> withdrawn++;
            }

            if (!"withdrawn".equalsIgnoreCase(status) && !"rejected".equalsIgnoreCase(status) && !"accepted".equalsIgnoreCase(status)) {
                activeApplicationIds.add(app.getId());
            }

            if (!"withdrawn".equalsIgnoreCase(status)) {
                nonWithdrawnApps.add(app);
            }
        }

        StatsDto.ApplicationCounts counts = new StatsDto.ApplicationCounts(
                all, applied, reviewing, interview, accepted, rejected, withdrawn
        );

        // Upcoming interviews: scheduledAt >= now, status == scheduled, belonging to active applications
        int upcomingInterviewCount = 0;
        if (!activeApplicationIds.isEmpty()) {
            Query query = Query.query(Criteria.where("applicationId").in(activeApplicationIds)
                    .and("status").is("scheduled")
                    .and("scheduledAt").gte(Instant.now()));
            upcomingInterviewCount = (int) mongoTemplate.count(query, Interview.class);
        }

        // avgMatchScore: for each non-withdrawn app, get latest analysis matching applicationId, cvId, jobId
        double totalScore = 0.0;
        int analyzedCount = 0;

        for (Application app : nonWithdrawnApps) {
            if (app.getId() == null || app.getCvId() == null || app.getJobId() == null) {
                continue;
            }
            Query q = Query.query(Criteria.where("applicationId").is(app.getId())
                            .and("cvId").is(app.getCvId())
                            .and("jobId").is(app.getJobId()))
                    .with(Sort.by(Sort.Direction.DESC, "analyzedAt", "_id"))
                    .limit(1);
            CvAnalysis analysis = mongoTemplate.findOne(q, CvAnalysis.class);
            if (analysis != null && analysis.getScores() != null && analysis.getScores().getOverall() != null) {
                totalScore += analysis.getScores().getOverall();
                analyzedCount++;
            }
        }

        Double avgMatchScore = null;
        if (analyzedCount > 0) {
            avgMatchScore = Math.round((totalScore / analyzedCount) * 10.0) / 10.0;
        }

        return new StatsDto(cvCount, all, upcomingInterviewCount, avgMatchScore, analyzedCount, counts);
    }

    // -------------------------------------------------------------
    // 3. Applications: GET and WITHDRAW
    // -------------------------------------------------------------

    public PageResponse<CandidateApplicationDto> getApplications(User user, String filter, int page, int size) {
        verifyCandidateAccess(user);
        if (filter == null || !ALLOWED_FILTERS.contains(filter.toLowerCase())) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số filter không hợp lệ: " + filter);
        }

        CandidateProfile profile = resolveProfile(user);
        if (profile == null) {
            return new PageResponse<>(Collections.emptyList(), page, size, 0, 0, true);
        }

        Criteria criteria = Criteria.where("candidateId").is(profile.getId());
        String f = filter.toLowerCase();
        switch (f) {
            case "applied" -> criteria.and("status").is("applied");
            case "reviewing" -> criteria.and("status").in("reviewing", "shortlisted");
            case "interview" -> criteria.and("status").in("interview", "interview_scheduled");
            case "accepted" -> criteria.and("status").is("accepted");
            case "rejected" -> criteria.and("status").is("rejected");
            case "withdrawn" -> criteria.and("status").is("withdrawn");
            // "all": no status constraint
        }

        Query countQuery = Query.query(criteria);
        long total = mongoTemplate.count(countQuery, Application.class);

        int totalPages = (int) Math.ceil((double) total / size);
        boolean last = (page + 1) >= totalPages || totalPages == 0;

        if (total == 0 || page >= totalPages) {
            return new PageResponse<>(Collections.emptyList(), page, size, total, totalPages, last);
        }

        Query query = Query.query(criteria)
                .with(Sort.by(Sort.Direction.DESC, "appliedAt", "_id"))
                .skip((long) page * size)
                .limit(size);

        List<Application> applications = mongoTemplate.find(query, Application.class);
        List<CandidateApplicationDto> dtoList = applications.stream()
                .map(app -> mapToApplicationDto(app))
                .toList();

        return new PageResponse<>(dtoList, page, size, total, totalPages, last);
    }

    public CandidateApplicationDto applyToJob(User user, String jobId, ApplyJobRequest request) {
        CandidateProfile profile = requireProfile(user);
        ObjectId jobObjectId = parseObjectId(jobId, "jobId");
        ObjectId cvObjectId = parseObjectId(request.cvId(), "cvId");
        Job job = jobRepository.findById(jobObjectId)
                .orElseThrow(() -> new NotFoundException("JOB_NOT_FOUND", "Không tìm thấy tin tuyển dụng."));
        if (!"published".equalsIgnoreCase(job.getStatus())
                || job.getDeadline() == null || !job.getDeadline().isAfter(Instant.now())) {
            throw new ConflictException("JOB_NOT_OPEN", "Tin tuyển dụng không còn nhận hồ sơ.");
        }
        cvRepository.findByIdAndCandidateId(cvObjectId, profile.getId())
                .orElseThrow(() -> new BadRequestException("CV_NOT_OWNED", "CV không thuộc tài khoản ứng viên."));
        if (applicationRepository.findByJobIdAndCandidateId(jobObjectId, profile.getId()).isPresent()) {
            throw new ConflictException("ALREADY_APPLIED", "Bạn đã ứng tuyển vị trí này rồi.");
        }

        Instant now = Instant.now();
        Application application = new Application();
        application.setJobId(jobObjectId);
        application.setCandidateId(profile.getId());
        application.setCvId(cvObjectId);
        application.setCoverNote(nullIfBlank(request.coverNote()));
        application.setStatus("applied");
        application.setAppliedAt(now);
        application.setUpdatedAt(now);
        application.setStatusHistory(List.of(new Application.StatusChange(
                "applied", now, parseObjectId(user.getId(), "userId"), "Ứng viên nộp hồ sơ")));
        return mapToApplicationDto(applicationRepository.save(application));
    }

    public CandidateApplicationDto withdrawApplication(User user, String applicationId) {
        CandidateProfile profile = requireProfile(user);
        ObjectId appId = parseObjectId(applicationId, "applicationId");

        Application application = applicationRepository.findById(appId)
                .filter(app -> profile.getId().equals(app.getCandidateId()))
                .orElseThrow(() -> new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy đơn ứng tuyển."));

        if ("withdrawn".equalsIgnoreCase(application.getStatus())) {
            // Idempotent: already withdrawn
            return mapToApplicationDto(application);
        }

        if (!"applied".equalsIgnoreCase(application.getStatus())) {
            throw new ConflictException("APPLICATION_NOT_WITHDRAWABLE", "Chỉ có thể rút đơn khi đơn ở trạng thái đã nộp (applied).");
        }

        Instant now = Instant.now();
        ObjectId userIdObj = parseObjectId(user.getId(), "userId");

        Query query = Query.query(Criteria.where("_id").is(appId)
                .and("candidateId").is(profile.getId())
                .and("status").is("applied"));

        Update update = new Update()
                .set("status", "withdrawn")
                .set("updatedAt", now)
                .push("statusHistory", new Application.StatusChange("withdrawn", now, userIdObj, "Ứng viên rút đơn"));

        Application updated = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Application.class
        );

        if (updated == null) {
            // Race condition: verify latest state
            Application latest = applicationRepository.findById(appId)
                    .filter(app -> profile.getId().equals(app.getCandidateId()))
                    .orElseThrow(() -> new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy đơn ứng tuyển."));
            if ("withdrawn".equalsIgnoreCase(latest.getStatus())) {
                return mapToApplicationDto(latest);
            }
            throw new ConflictException("APPLICATION_NOT_WITHDRAWABLE", "Đơn ứng tuyển đã chuyển sang trạng thái khác.");
        }

        return mapToApplicationDto(updated);
    }

    private CandidateApplicationDto mapToApplicationDto(Application app) {
        // Job and Company
        CandidateApplicationDto.JobInfo jobInfo = null;
        CandidateApplicationDto.CompanyInfo companyInfo = null;

        if (app.getJobId() != null) {
            Optional<Job> jobOpt = jobRepository.findById(app.getJobId());
            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();

                CandidateApplicationDto.JobInfo.SalaryInfo salaryInfo = null;
                if (job.getSalary() != null) {
                    salaryInfo = new CandidateApplicationDto.JobInfo.SalaryInfo(
                            job.getSalary().getMin(),
                            job.getSalary().getMax(),
                            job.getSalary().getCurrency(),
                            job.getSalary().getNegotiable()
                    );
                }

                CandidateApplicationDto.JobInfo.LocationInfo locationInfo = null;
                if (job.getLocation() != null) {
                    locationInfo = new CandidateApplicationDto.JobInfo.LocationInfo(
                            nullIfBlank(job.getLocation().getAddress()),
                            nullIfBlank(job.getLocation().getCity()),
                            nullIfBlank(job.getLocation().getCountry()),
                            job.getLocation().getRemote()
                    );
                }

                jobInfo = new CandidateApplicationDto.JobInfo(
                        job.getId().toHexString(),
                        job.getTitle(),
                        job.getEmploymentType(),
                        salaryInfo,
                        locationInfo
                );

                if (job.getCompanyId() != null) {
                    Optional<Company> companyOpt = companyRepository.findById(job.getCompanyId());
                    if (companyOpt.isPresent()) {
                        Company company = companyOpt.get();
                        companyInfo = new CandidateApplicationDto.CompanyInfo(
                                company.getId().toHexString(),
                                company.getName(),
                                company.getIndustry(),
                                company.getLogoUrl()
                        );
                    }
                }
            }
        }

        // AiAnalysis (latest matching app, cv, job)
        CandidateApplicationDto.AiAnalysisInfo aiAnalysisInfo = null;
        if (app.getId() != null && app.getCvId() != null && app.getJobId() != null) {
            Query q = Query.query(Criteria.where("applicationId").is(app.getId())
                            .and("cvId").is(app.getCvId())
                            .and("jobId").is(app.getJobId()))
                    .with(Sort.by(Sort.Direction.DESC, "analyzedAt", "_id"))
                    .limit(1);
            CvAnalysis analysis = mongoTemplate.findOne(q, CvAnalysis.class);
            if (analysis != null) {
                CandidateApplicationDto.AiAnalysisInfo.ScoresInfo scoresInfo = null;
                Integer overallScore = null;
                if (analysis.getScores() != null) {
                    overallScore = analysis.getScores().getOverall();
                    scoresInfo = new CandidateApplicationDto.AiAnalysisInfo.ScoresInfo(
                            analysis.getScores().getOverall(),
                            analysis.getScores().getSkills(),
                            analysis.getScores().getExperience(),
                            analysis.getScores().getEducation(),
                            analysis.getScores().getProjects(),
                            analysis.getScores().getCertificates()
                    );
                }

                aiAnalysisInfo = new CandidateApplicationDto.AiAnalysisInfo(
                        analysis.getId().toHexString(),
                        analysis.getAnalyzedAt(),
                        overallScore,
                        scoresInfo,
                        analysis.getRecommendation(),
                        analysis.getMatchedSkills() != null ? analysis.getMatchedSkills() : Collections.emptyList(),
                        analysis.getMissingSkills() != null ? analysis.getMissingSkills() : Collections.emptyList(),
                        analysis.getStrengths() != null ? analysis.getStrengths() : Collections.emptyList(),
                        analysis.getWeaknesses() != null ? analysis.getWeaknesses() : Collections.emptyList()
                );
            }
        }

        // Accept the current HR status and legacy interview_scheduled records.
        CandidateApplicationDto.InterviewInfo interviewInfo = null;
        if (("interview".equalsIgnoreCase(app.getStatus())
                || "interview_scheduled".equalsIgnoreCase(app.getStatus()))
                && app.getId() != null) {
            Instant now = Instant.now();
            // Upcoming nearest (scheduledAt >= now, scheduledAt ASC, _id ASC)
            Query upcomingQ = Query.query(Criteria.where("applicationId").is(app.getId())
                            .and("status").is("scheduled")
                            .and("scheduledAt").gte(now))
                    .with(Sort.by(Sort.Direction.ASC, "scheduledAt", "_id"))
                    .limit(1);
            Interview interview = mongoTemplate.findOne(upcomingQ, Interview.class);

            if (interview == null) {
                // Past nearest (scheduledAt < now, scheduledAt DESC, _id DESC)
                Query pastQ = Query.query(Criteria.where("applicationId").is(app.getId())
                                .and("status").is("scheduled")
                                .and("scheduledAt").lt(now))
                        .with(Sort.by(Sort.Direction.DESC, "scheduledAt", "_id"))
                        .limit(1);
                interview = mongoTemplate.findOne(pastQ, Interview.class);
            }

            if (interview != null) {
                String meetingLink = interview.getMeetingLink();
                if (meetingLink != null && !meetingLink.startsWith("https://")) {
                    meetingLink = null;
                }
                interviewInfo = new CandidateApplicationDto.InterviewInfo(
                        interview.getId().toHexString(),
                        interview.getScheduledAt(),
                        interview.getDurationMinutes(),
                        interview.getMode(),
                        interview.getLocation(),
                        meetingLink,
                        interview.getStatus()
                );
            }
        }

        boolean canWithdraw = "applied".equalsIgnoreCase(app.getStatus());

        return new CandidateApplicationDto(
                app.getId().toHexString(),
                app.getCvId() != null ? app.getCvId().toHexString() : null,
                app.getJobId() != null ? app.getJobId().toHexString() : null,
                app.getStatus(),
                app.getAppliedAt(),
                app.getUpdatedAt(),
                canWithdraw,
                jobInfo,
                companyInfo,
                aiAnalysisInfo,
                interviewInfo
        );
    }

    // -------------------------------------------------------------
    // 4. CVs: GET list, GET file, DELETE, and UPLOAD
    // -------------------------------------------------------------

    public PageResponse<CvSummaryDto> getCvList(User user, int page, int size) {
        CandidateProfile profile = resolveProfile(user);
        if (profile == null) {
            return new PageResponse<>(Collections.emptyList(), page, size, 0, 0, true);
        }

        ObjectId candidateId = profile.getId();
        long total = cvRepository.countByCandidateId(candidateId);
        int totalPages = (int) Math.ceil((double) total / size);
        boolean last = (page + 1) >= totalPages || totalPages == 0;

        if (total == 0 || page >= totalPages) {
            return new PageResponse<>(Collections.emptyList(), page, size, total, totalPages, last);
        }

        Query query = Query.query(Criteria.where("candidateId").is(candidateId))
                .with(Sort.by(Sort.Direction.DESC, "createdAt", "_id"))
                .skip((long) page * size)
                .limit(size);

        List<Cv> cvs = mongoTemplate.find(query, Cv.class);
        List<CvSummaryDto> dtoList = cvs.stream()
                .map(cv -> mapToCvSummaryDto(cv))
                .toList();

        return new PageResponse<>(dtoList, page, size, total, totalPages, last);
    }

    public CvSummaryDto createCvFromTemplate(User user, CreateCvFromTemplateRequest request) {
        CandidateProfile profile = requireProfile(user);
        if (request == null) {
            throw new BadRequestException("VALIDATION_ERROR", "Dữ liệu tạo CV không được để trống.");
        }
        validateTemplateCvRequest(request);

        CvTemplate template = cvTemplateService.requireActiveTemplate(request.templateId());
        byte[] pdfBytes = cvTemplatePdfRenderer.render(template, request);

        String title = request.title().trim();
        String fileName = buildTemplatePdfFileName(title);
        ObjectId gridFsFileId = cvGridFsStorageService.storePdf(
                pdfBytes, fileName, profile.getId(), template.getId());

        Instant now = Instant.now();
        Cv cv = new Cv();
        cv.setId(new ObjectId());
        cv.setCandidateId(profile.getId());
        cv.setTemplateId(template.getId());
        cv.setTitle(title);
        cv.setSource(Cv.Source.template(gridFsFileId, fileName, "application/pdf"));
        cv.setParseInfo(new Cv.ParseInfo("pending", null, null));
        cv.setPersonalInfo(buildTemplatePersonalInfo(request.content().personalInfo()));
        cv.setLinks(mapTemplateLinks(request.content().personalInfo().links()));
        cv.setSummary(nullIfBlank(trimOrNull(request.content().summary())));
        cv.setExperience(mapTemplateExperience(request.content().experience()));
        cv.setEducation(mapTemplateEducation(request.content().education()));
        cv.setSkills(mapTemplateSkills(request.content().skills()));
        cv.setCreatedAt(now);
        cv.setUpdatedAt(now);

        try {
            Cv saved = cvRepository.save(cv);
            return mapToCvSummaryDto(saved);
        } catch (RuntimeException ex) {
            cvGridFsStorageService.deleteQuietly(gridFsFileId);
            throw ex;
        }
    }

    public CvFileInfo getCvFile(User user, String cvId) {
        CandidateProfile profile = requireProfile(user);
        ObjectId cvObjectId = parseObjectId(cvId, "cvId");

        Cv cv = cvRepository.findByIdAndCandidateId(cvObjectId, profile.getId())
                .orElseThrow(() -> new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy CV hoặc CV không thuộc về bạn."));

        if (cv.getSource() == null) {
            throw new NotFoundException("CV_FILE_NOT_FOUND", "CV không có tệp xem được.");
        }

        if (!"application/pdf".equalsIgnoreCase(cv.getSource().getMimeType())) {
            throw new UnsupportedFileTypeException("UNSUPPORTED_FILE_TYPE", "Định dạng tệp không được hỗ trợ. Chỉ hỗ trợ PDF.");
        }

        String fileName = cv.getSource().getFileName() != null ? cv.getSource().getFileName() : "cv.pdf";
        if ("template".equalsIgnoreCase(cv.getSource().getType())) {
            if (cv.getSource().getFileId() == null) {
                throw new NotFoundException("CV_FILE_NOT_FOUND", "Không tìm thấy tệp CV trong hệ thống lưu trữ.");
            }
            Resource resource = cvGridFsStorageService.getPdfResource(cv.getSource().getFileId());
            return new CvFileInfo(resource, fileName, "application/pdf");
        }

        if (cv.getSource().getFileUrl() == null || cv.getSource().getFileUrl().isBlank()) {
            throw new NotFoundException("CV_FILE_NOT_FOUND", "CV không có tệp xem được.");
        }

        Path path = Paths.get(cv.getSource().getFileUrl());
        if (!Files.exists(path)) {
            throw new NotFoundException("CV_FILE_NOT_FOUND", "Không tìm thấy tệp CV trên hệ thống lưu trữ.");
        }

        return new CvFileInfo(path, fileName, "application/pdf");
    }

    public void deleteCv(User user, String cvId) {
        CandidateProfile profile = requireProfile(user);
        ObjectId cvObjectId = parseObjectId(cvId, "cvId");

        Cv cv = cvRepository.findByIdAndCandidateId(cvObjectId, profile.getId())
                .orElseThrow(() -> new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy CV hoặc CV không thuộc về bạn."));

        // Check references: applications or cv_analyses
        boolean inApplications = applicationRepository.existsByCvId(cvObjectId);
        boolean inAnalyses = cvAnalysisRepository.existsByCvId(cvObjectId);

        if (inApplications || inAnalyses) {
            throw new ConflictException("CV_IN_USE", "CV đang được sử dụng trong đơn ứng tuyển hoặc báo cáo phân tích, không thể xóa.");
        }

        if (cv.getSource() != null && "template".equalsIgnoreCase(cv.getSource().getType())) {
            if (cv.getSource().getFileId() != null) {
                cvGridFsStorageService.delete(cv.getSource().getFileId());
            }
            cvRepository.delete(cv);
            return;
        }

        // Delete from DB
        cvRepository.delete(cv);

        // Best effort physical file deletion
        if (cv.getSource() != null && cv.getSource().getFileUrl() != null) {
            try {
                Path path = Paths.get(cv.getSource().getFileUrl());
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
                // Log and ignore to prevent cascading failure
            }
        }
    }

    public CvSummaryDto parseCv(User user, String cvId) {
        CandidateProfile profile = requireProfile(user);
        ObjectId cvObjectId = parseObjectId(cvId, "cvId");
        Cv parsed = cvParsingService.parseAndSave(cvObjectId, profile.getId());
        return mapToCvSummaryDto(parsed);
    }

    public CvSummaryDto uploadCv(MultipartFile file, User user) {
        CandidateProfile profile = requireProfile(user);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("VALIDATION_ERROR", "Tệp tải lên không được để trống.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("FILE_TOO_LARGE", "Kích thước file vượt quá giới hạn cho phép (tối đa 5MB)");
        }

        // Validate real PDF magic bytes
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[5];
            int read = is.read(header);
            if (read < 5 || !"%PDF-".equals(new String(header, StandardCharsets.US_ASCII))) {
                throw new UnsupportedFileTypeException("UNSUPPORTED_FILE_TYPE", "Nội dung tệp không phải định dạng PDF hợp lệ.");
            }
        } catch (IOException e) {
            throw new BadRequestException("VALIDATION_ERROR", "Không thể đọc nội dung tệp tải lên.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv.pdf"
        );

        String uniqueFileName = UUID.randomUUID() + ".pdf";
        Path targetLocation = this.uploadStorageLocation.resolve(uniqueFileName);

        try {
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new FileStorageException("Không thể lưu trữ tệp CV: " + ex.getMessage());
        }

        String title = originalFilename;
        if (title.toLowerCase().endsWith(".pdf")) {
            title = title.substring(0, title.length() - 4);
        }
        title = title.replaceAll("[^a-zA-Z0-9\\s\\-_À-ỹ]", " ").trim();
        if (title.isBlank()) {
            title = "CV Ứng viên";
        }

        Instant now = Instant.now();
        Cv cv = new Cv();
        cv.setId(new ObjectId());
        cv.setCandidateId(profile.getId());
        cv.setTemplateId(null);
        cv.setTitle(title);
        cv.setSource(new Cv.Source("uploaded", originalFilename, targetLocation.toString(), "application/pdf"));
        cv.setParseInfo(new Cv.ParseInfo("pending", now, CvParsingService.PARSER_VERSION));
        String city = profile.getLocation() != null ? Objects.toString(profile.getLocation().getCity(), "") : "";
        String country = profile.getLocation() != null ? Objects.toString(profile.getLocation().getCountry(), "") : "";
        cv.setPersonalInfo(Map.of(
                "fullName", Objects.toString(profile.getFullName(), ""),
                "email", Objects.toString(user.getEmail(), ""),
                "phone", Objects.toString(profile.getPhone(), ""),
                "address", Map.of("city", city, "country", country)
        ));
        cv.setCreatedAt(now);
        cv.setUpdatedAt(now);

        try {
            Cv saved = cvRepository.save(cv);
            return mapToCvSummaryDto(saved);
        } catch (RuntimeException ex) {
            try {
                Files.deleteIfExists(targetLocation);
            } catch (IOException ignored) {}
            throw ex;
        }
    }

    private void validateTemplateCvRequest(CreateCvFromTemplateRequest request) {
        CreateCvFromTemplateRequest.ContentInput content = request.content();
        CreateCvFromTemplateRequest.PersonalInfoInput personal = content.personalInfo();

        long totalChars = safeLength(request.templateId())
                + safeLength(request.title())
                + safeLength(personal.fullName())
                + safeLength(personal.email())
                + safeLength(personal.phone())
                + safeLength(personal.location())
                + safeLength(content.summary());

        if (personal.links() != null) {
            for (String link : personal.links()) {
                if (link == null || link.isBlank()) {
                    throw new BadRequestException("VALIDATION_ERROR", "Liên kết không được để trống.");
                }
                validateHttpUrl(link.trim());
                totalChars += link.length();
            }
        }
        if (content.experience() != null) {
            for (CreateCvFromTemplateRequest.ExperienceInput item : content.experience()) {
                if (item == null) {
                    throw new BadRequestException("VALIDATION_ERROR", "Mục kinh nghiệm không được null.");
                }
                totalChars += safeLength(item.role())
                        + safeLength(item.company())
                        + safeLength(item.startDate())
                        + safeLength(item.endDate())
                        + safeLength(item.description());
            }
        }
        if (content.education() != null) {
            for (CreateCvFromTemplateRequest.EducationInput item : content.education()) {
                if (item == null) {
                    throw new BadRequestException("VALIDATION_ERROR", "Mục học vấn không được null.");
                }
                totalChars += safeLength(item.school())
                        + safeLength(item.degree())
                        + safeLength(item.startDate())
                        + safeLength(item.endDate())
                        + safeLength(item.description());
            }
        }
        if (content.skills() != null) {
            for (String skill : content.skills()) {
                if (skill == null || skill.isBlank()) {
                    throw new BadRequestException("VALIDATION_ERROR", "Tên kỹ năng không được để trống.");
                }
                totalChars += skill.length();
            }
        }
        if (totalChars > MAX_TEMPLATE_CV_TOTAL_CHARS) {
            throw new BadRequestException("VALIDATION_ERROR", "Dữ liệu CV vượt quá kích thước cho phép.");
        }
    }

    private void validateHttpUrl(String value) {
        try {
            URI uri = URI.create(value);
            String scheme = uri.getScheme();
            if (scheme == null
                    || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))
                    || uri.getHost() == null
                    || uri.getHost().isBlank()) {
                throw new BadRequestException("VALIDATION_ERROR", "Liên kết phải sử dụng http:// hoặc https://.");
            }
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("VALIDATION_ERROR", "Liên kết không đúng định dạng URL.");
        }
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }

    private String trimOrNull(String value) {
        return value == null ? null : value.trim();
    }

    private String buildTemplatePdfFileName(String title) {
        String replaced = title.replace('đ', 'd').replace('Đ', 'D');
        String ascii = Normalizer.normalize(replaced, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = ascii.replaceAll("[^A-Za-z0-9]+", "_").replaceAll("^_+|_+$", "");
        if (slug.isBlank()) {
            slug = "cv";
        }
        if (slug.length() > 80) {
            slug = slug.substring(0, 80).replaceAll("_+$", "");
            if (slug.isBlank()) {
                slug = "cv";
            }
        }
        return slug + ".pdf";
    }

    private Map<String, Object> buildTemplatePersonalInfo(CreateCvFromTemplateRequest.PersonalInfoInput personal) {
        Map<String, Object> map = new HashMap<>();
        map.put("fullName", personal.fullName().trim());
        map.put("email", personal.email().trim());
        String phone = nullIfBlank(trimOrNull(personal.phone()));
        if (phone != null) {
            map.put("phone", phone);
        }
        String location = nullIfBlank(trimOrNull(personal.location()));
        if (location != null) {
            map.put("address", Map.of("city", location));
        }
        return map;
    }

    private List<Cv.Link> mapTemplateLinks(List<String> links) {
        if (links == null || links.isEmpty()) {
            return new ArrayList<>();
        }
        return links.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(url -> new Cv.Link(null, url))
                .toList();
    }

    private List<Cv.Experience> mapTemplateExperience(List<CreateCvFromTemplateRequest.ExperienceInput> items) {
        if (items == null || items.isEmpty()) {
            return new ArrayList<>();
        }
        List<Cv.Experience> mapped = new ArrayList<>();
        for (CreateCvFromTemplateRequest.ExperienceInput item : items) {
            Cv.Experience exp = new Cv.Experience();
            exp.setPosition(nullIfBlank(trimOrNull(item.role())));
            exp.setCompany(nullIfBlank(trimOrNull(item.company())));
            exp.setStartDate(nullIfBlank(trimOrNull(item.startDate())));
            exp.setEndDate(nullIfBlank(trimOrNull(item.endDate())));
            exp.setDescription(nullIfBlank(trimOrNull(item.description())));
            mapped.add(exp);
        }
        return mapped;
    }

    private List<Cv.Education> mapTemplateEducation(List<CreateCvFromTemplateRequest.EducationInput> items) {
        if (items == null || items.isEmpty()) {
            return new ArrayList<>();
        }
        List<Cv.Education> mapped = new ArrayList<>();
        for (CreateCvFromTemplateRequest.EducationInput item : items) {
            Cv.Education edu = new Cv.Education();
            edu.setInstitution(nullIfBlank(trimOrNull(item.school())));
            edu.setDegree(nullIfBlank(trimOrNull(item.degree())));
            edu.setStartDate(nullIfBlank(trimOrNull(item.startDate())));
            edu.setEndDate(nullIfBlank(trimOrNull(item.endDate())));
            edu.setDescription(nullIfBlank(trimOrNull(item.description())));
            mapped.add(edu);
        }
        return mapped;
    }

    private List<Cv.Skill> mapTemplateSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return new ArrayList<>();
        }
        return skills.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(name -> new Cv.Skill(name, null, null, null))
                .toList();
    }

    private CvSummaryDto mapToCvSummaryDto(Cv cv) {
        CvSummaryDto.SourceInfo sourceInfo = null;
        boolean canViewFile = false;
        if (cv.getSource() != null) {
            sourceInfo = new CvSummaryDto.SourceInfo(
                    cv.getSource().getType(),
                    cv.getSource().getFileName(),
                    cv.getSource().getMimeType()
            );
            boolean isPdf = "application/pdf".equalsIgnoreCase(cv.getSource().getMimeType());
            if ("template".equalsIgnoreCase(cv.getSource().getType())) {
                canViewFile = isPdf && cv.getSource().getFileId() != null;
            } else {
                canViewFile = isPdf
                        && cv.getSource().getFileUrl() != null
                        && !cv.getSource().getFileUrl().isBlank();
            }
        }

        CvSummaryDto.ParseInfoDto parseInfoDto = null;
        if (cv.getParseInfo() != null) {
            parseInfoDto = new CvSummaryDto.ParseInfoDto(
                    cv.getParseInfo().getStatus(),
                    cv.getParseInfo().getParsedAt(),
                    cv.getParseInfo().getParserVersion()
            );
        }

        List<CvSummaryDto.SkillDto> skillDtos = Collections.emptyList();
        if (cv.getSkills() != null) {
            skillDtos = cv.getSkills().stream()
                    .map(s -> new CvSummaryDto.SkillDto(
                            s.getName(),
                            s.getCategory(),
                            nullIfBlank(s.getLevel()),
                            s.getYearsOfExperience()
                    ))
                    .toList();
        }

        boolean inApplications = applicationRepository.existsByCvId(cv.getId());
        boolean inAnalyses = cvAnalysisRepository.existsByCvId(cv.getId());
        boolean canDelete = !inApplications && !inAnalyses;
        String deleteBlockedReason = canDelete ? null : "CV_IN_USE";

        return new CvSummaryDto(
                cv.getId().toHexString(),
                cv.getTemplateId() != null ? cv.getTemplateId().toHexString() : null,
                cv.getTitle(),
                sourceInfo,
                parseInfoDto,
                skillDtos,
                cv.getCreatedAt(),
                cv.getUpdatedAt(),
                canViewFile,
                canDelete,
                deleteBlockedReason
        );
    }

    // -------------------------------------------------------------
    // 5. Career: GET
    // -------------------------------------------------------------

    public CareerDto getCareer(User user, String cvId) {
        CandidateProfile profile = resolveProfile(user);
        if (profile == null) {
            return new CareerDto(null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        Cv cv = null;
        if (cvId != null && !cvId.isBlank()) {
            ObjectId cvObjectId = parseObjectId(cvId, "cvId");
            cv = cvRepository.findByIdAndCandidateId(cvObjectId, profile.getId())
                    .orElseThrow(() -> new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy CV hoặc CV không thuộc về bạn."));
        } else {
            cv = cvRepository.findFirstByCandidateIdOrderByCreatedAtDescIdDesc(profile.getId()).orElse(null);
        }

        if (cv == null) {
            return new CareerDto(null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        CareerDto.CvInfo cvInfo = new CareerDto.CvInfo(
                cv.getId().toHexString(),
                cv.getTitle(),
                cv.getSource() != null ? cv.getSource().getFileName() : null,
                cv.getParseInfo() != null ? new CareerDto.ParseInfoDto(
                        cv.getParseInfo().getStatus(),
                        cv.getParseInfo().getParsedAt(),
                        cv.getParseInfo().getParserVersion()
                ) : null
        );

        List<CareerDto.SkillDto> skills = Collections.emptyList();
        if (cv.getSkills() != null) {
            skills = cv.getSkills().stream()
                    .map(s -> new CareerDto.SkillDto(
                            s.getName(),
                            s.getCategory(),
                            nullIfBlank(s.getLevel()),
                            s.getYearsOfExperience() != null ? s.getYearsOfExperience() : 0
                    ))
                    .toList();
        }

        List<CareerDto.ExperienceDto> experience = Collections.emptyList();
        if (cv.getExperience() != null) {
            experience = cv.getExperience().stream()
                    .map(e -> new CareerDto.ExperienceDto(
                            nullIfBlank(e.getPosition()),
                            nullIfBlank(e.getCompany()),
                            nullIfBlank(e.getLocation()),
                            nullIfBlank(e.getEmploymentType()),
                            nullIfBlank(e.getStartDate()),
                            nullIfBlank(e.getEndDate()),
                            e.getCurrent(),
                            nullIfBlank(e.getDescription()),
                            e.getAchievements() != null ? e.getAchievements() : Collections.emptyList(),
                            e.getTechnologies() != null ? e.getTechnologies() : Collections.emptyList()
                    ))
                    .toList();
        }

        List<CareerDto.EducationDto> education = Collections.emptyList();
        if (cv.getEducation() != null) {
            education = cv.getEducation().stream()
                    .map(ed -> {
                        CareerDto.GpaDto gpaDto = null;
                        if (ed.getGpa() != null) {
                            gpaDto = new CareerDto.GpaDto(ed.getGpa().getValue(), ed.getGpa().getScale());
                        }
                        return new CareerDto.EducationDto(
                                nullIfBlank(ed.getDegree()),
                                nullIfBlank(ed.getMajor()),
                                nullIfBlank(ed.getInstitution()),
                                nullIfBlank(ed.getStartDate()),
                                nullIfBlank(ed.getEndDate()),
                                nullIfBlank(ed.getStatus()),
                                gpaDto,
                                nullIfBlank(ed.getDescription())
                        );
                    })
                    .toList();
        }

        List<CareerDto.CertificateDto> certificates = Collections.emptyList();
        if (cv.getCertificates() != null) {
            certificates = cv.getCertificates().stream()
                    .map(c -> new CareerDto.CertificateDto(
                            nullIfBlank(c.getName()),
                            nullIfBlank(c.getIssuer()),
                            nullIfBlank(c.getIssueDate()),
                            nullIfBlank(c.getCredentialId()),
                            nullIfBlank(c.getCredentialUrl()),
                            nullIfBlank(c.getExpirationDate())
                    ))
                    .toList();
        }

        return new CareerDto(cvInfo, skills, experience, education, certificates);
    }
}
