package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.resumeanalyser.backend.dto.CreateJobRequest;
import com.resumeanalyser.backend.dto.JobResponse;
import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.JobRepository;

@Service
public class JobService {

    private static final List<String> EMPLOYMENT_TYPES = List.of(
            "full_time", "part_time", "internship", "contract", "freelance");
    private static final Set<String> REQUIREMENT_FIELDS = Set.of(
            "requiredSkills", "preferredSkills", "education", "minimumGpa", "languages");

    private final JobRepository jobRepository;
    private final MongoTemplate mongoTemplate;
    private final RecruiterIdentityService recruiterIdentity;

    public JobService(
            JobRepository jobRepository,
            MongoTemplate mongoTemplate,
            RecruiterIdentityService recruiterIdentity) {
        this.jobRepository = jobRepository;
        this.mongoTemplate = mongoTemplate;
        this.recruiterIdentity = recruiterIdentity;
    }

    // Lấy danh sách Job thuộc HR đang đăng nhập
    public List<Job> getMyJobs(User recruiter) {
        ObjectId recruiterId = recruiterIdentity.requireProfileId(recruiter);
        return jobRepository.findByRecruiterId(recruiterId);
    }



    // Tạo job và luôn gắn đúng recruiter profile/company của tài khoản đăng nhập.
    public Job createJob(CreateJobRequest request, User recruiter) {
        RecruiterProfile profile = recruiterIdentity.requireProfile(recruiter);
        if (profile.getCompanyId() == null) {
            throw new ForbiddenException(
                    "RECRUITER_COMPANY_REQUIRED",
                    "Hồ sơ nhà tuyển dụng chưa được liên kết với công ty.");
        }
        if (request.companyId() != null && !request.companyId().isBlank()) {
            if (!ObjectId.isValid(request.companyId())) {
                throw new IllegalArgumentException("Company ID không hợp lệ");
            }
            if (!profile.getCompanyId().equals(new ObjectId(request.companyId()))) {
                throw new ForbiddenException(
                        "RECRUITER_COMPANY_MISMATCH",
                        "Không thể tạo Job cho công ty khác.");
            }
        }

        if (request.title() == null
                || request.title().isBlank()) {
            throw new IllegalArgumentException("Title không được để trống");
        }

        if (request.deadline() == null
                || !request.deadline().isAfter(Instant.now())) {
            throw new IllegalArgumentException("Deadline phải ở tương lai");
        }

        validateJobSchema(request);

        Job job = new Job();

        job.setCompanyId(profile.getCompanyId());
        job.setRecruiterId(profile.getId());

        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setCategory(request.category());
        job.setEmploymentType(request.employmentType());

        job.setLocation(request.location());
        job.setSalary(request.salary());
        job.setExperience(request.experience());
        job.setRequirements(request.requirements());
        job.setBenefits(request.benefits());

        job.setDeadline(request.deadline());

        // Job mới mặc định ở trạng thái draft
        job.setStatus("draft");

        Instant now = Instant.now();
        job.setCreatedAt(now);
        job.setUpdatedAt(now);

        return jobRepository.save(job);
    }

    private static void validateJobSchema(CreateJobRequest request) {
        if (request.description() == null) {
            throw new IllegalArgumentException("description là trường bắt buộc");
        }
        if (request.employmentType() != null
                && !EMPLOYMENT_TYPES.contains(request.employmentType())) {
            throw new IllegalArgumentException("employmentType không hợp lệ; dùng "
                    + String.join(", ", EMPLOYMENT_TYPES));
        }

        Map<String, Object> requirements = request.requirements();
        if (requirements == null) {
            return;
        }
        validateKeys(requirements, "requirements", REQUIREMENT_FIELDS);
        for (Map.Entry<String, Object> field : requirements.entrySet()) {
            String path = "requirements." + field.getKey();
            switch (field.getKey()) {
                case "requiredSkills", "preferredSkills" -> validateStringList(field.getValue(), path);
                case "education" -> {
                    Map<?, ?> education = requireObject(field.getValue(), path);
                    validateKeys(education, path, Set.of("minimumDegree", "preferredMajors"));
                    if (education.containsKey("minimumDegree")) {
                        requireString(education.get("minimumDegree"), path + ".minimumDegree");
                    }
                    if (education.containsKey("preferredMajors")) {
                        validateStringList(education.get("preferredMajors"), path + ".preferredMajors");
                    }
                }
                case "minimumGpa" -> {
                    Map<?, ?> gpa = requireObject(field.getValue(), path);
                    validateKeys(gpa, path, Set.of("value", "scale"));
                    requireNumber(gpa.get("value"), path + ".value");
                    requireNumber(gpa.get("scale"), path + ".scale");
                }
                case "languages" -> {
                    if (!(field.getValue() instanceof List<?> languages)) {
                        throw new IllegalArgumentException(path + " phải là mảng");
                    }
                    for (int i = 0; i < languages.size(); i++) {
                        String itemPath = path + "[" + i + "]";
                        Map<?, ?> language = requireObject(languages.get(i), itemPath);
                        validateKeys(language, itemPath, Set.of("name", "minimumLevel"));
                        requireString(language.get("name"), itemPath + ".name");
                        if (language.containsKey("minimumLevel")) {
                            requireString(language.get("minimumLevel"), itemPath + ".minimumLevel");
                        }
                    }
                }
                default -> throw new IllegalArgumentException(path + " không được hỗ trợ");
            }
        }
    }

    private static void validateKeys(Map<?, ?> object, String path, Set<String> allowed) {
        for (Object key : object.keySet()) {
            if (!allowed.contains(key)) {
                throw new IllegalArgumentException(path + "." + key + " không được hỗ trợ");
            }
        }
    }

    private static Map<?, ?> requireObject(Object value, String path) {
        if (!(value instanceof Map<?, ?> object)) {
            throw new IllegalArgumentException(path + " phải là JSON object");
        }
        return object;
    }

    private static void requireString(Object value, String path) {
        if (!(value instanceof String)) {
            throw new IllegalArgumentException(path + " phải là chuỗi");
        }
    }

    private static void requireNumber(Object value, String path) {
        if (!(value instanceof Number)
                || (value instanceof Double number && !Double.isFinite(number))
                || (value instanceof Float number && !Float.isFinite(number))) {
            throw new IllegalArgumentException(path + " phải là số hữu hạn");
        }
    }

    private static void validateStringList(Object value, String path) {
        if (!(value instanceof List<?> values)) {
            throw new IllegalArgumentException(path + " phải là mảng chuỗi");
        }
        for (int i = 0; i < values.size(); i++) {
            requireString(values.get(i), path + "[" + i + "]");
        }
    }

    // Tìm job theo ID
    public Job getJobById(String jobId, User recruiter) {

    if (!ObjectId.isValid(jobId)) {
        throw new IllegalArgumentException("Job ID không hợp lệ");
    }

    ObjectId id = new ObjectId(jobId);
    ObjectId recruiterId = recruiterIdentity.requireProfileId(recruiter);

    return jobRepository
            .findByIdAndRecruiterId(id, recruiterId)
            .orElseThrow(() ->
                    new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.NOT_FOUND,
                            "Không tìm thấy Job"
                    )
            );
    }



    //Cập nhật thông tin job
    public Job updateJob(
        String jobId,
        CreateJobRequest request,
        User recruiter) {

    // Kiểm tra Job ID
    if (!ObjectId.isValid(jobId)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid Job ID"
        );
    }

    ObjectId id = new ObjectId(jobId);
    ObjectId recruiterId = recruiterIdentity.requireProfileId(recruiter);

    // Chỉ tìm Job thuộc HR đang đăng nhập
    Job job = jobRepository
            .findByIdAndRecruiterId(id, recruiterId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            ));

    validateJobSchema(request);

    // Cập nhật thông tin
    job.setTitle(request.title());
    job.setDescription(request.description());
    job.setCategory(request.category());
    job.setEmploymentType(request.employmentType());

    job.setLocation(request.location());
    job.setSalary(request.salary());
    job.setExperience(request.experience());
    job.setRequirements(request.requirements());
    job.setBenefits(request.benefits());
    job.setDeadline(request.deadline());

    // Không thay đổi recruiterId, companyId, createdAt, status
    job.setUpdatedAt(Instant.now());

    return jobRepository.save(job);
    }

    //Cập nhật job
    public Job updateJobStatus(
        String jobId,
        String newStatus,
        User recruiter) {

    // Kiểm tra ID
    if (!ObjectId.isValid(jobId)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid Job ID"
        );
    }

    // Kiểm tra status hợp lệ
    if (newStatus == null
            || !List.of("draft", "published", "closed")
                    .contains(newStatus)) {

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid job status"
        );
    }

    ObjectId id = new ObjectId(jobId);
    ObjectId recruiterId = recruiterIdentity.requireProfileId(recruiter);

    // Chỉ tìm Job thuộc HR đang đăng nhập
    Job job = jobRepository
            .findByIdAndRecruiterId(id, recruiterId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            ));

    // Cập nhật trạng thái
    job.setStatus(newStatus);
    job.setUpdatedAt(Instant.now());

    return jobRepository.save(job);
    }


    //Xóa job
    public void deleteJob(String jobId, User recruiter) {

    if (!ObjectId.isValid(jobId)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid Job ID"
        );
    }

    ObjectId id = new ObjectId(jobId);
    ObjectId recruiterId = recruiterIdentity.requireProfileId(recruiter);

    // Chỉ tìm Job thuộc HR đang đăng nhập
    Job job = jobRepository
            .findByIdAndRecruiterId(id, recruiterId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            ));

    // Xóa Job khỏi MongoDB
    jobRepository.delete(job);
    }

    /**
     * Query tìm kiếm việc làm từ collection jobs trong MongoDB:
     * - keyword: tìm trong title, description, category, requiredSkills, preferredSkills
     * - profession: tìm trong category
     * - location: tìm trong location.city, location.address, location.country (hoặc remote = true)
     */
    public PageResponse<JobResponse> searchJobs(String keyword, String profession, String location, int page, int size) {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 10;
        }
        if (size > 100) {
            size = 100;
        }

        List<Criteria> criteriaList = new java.util.ArrayList<>();

        // 1. Chỉ tìm các tin tuyển dụng đang công khai (status = "published")
        criteriaList.add(Criteria.where("status").is("published"));

        // 2. Query theo từ khóa (keyword)
        if (keyword != null && !keyword.trim().isEmpty()) {
            String regex = Pattern.quote(keyword.trim());
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i"),
                    Criteria.where("category").regex(regex, "i"),
                    Criteria.where("requirements.requiredSkills").regex(regex, "i"),
                    Criteria.where("requirements.preferredSkills").regex(regex, "i")
            ));
        }

        // 3. Query theo nghề nghiệp / danh mục (profession/category)
        if (profession != null && !profession.trim().isEmpty()) {
            criteriaList.add(Criteria.where("category").regex(Pattern.quote(profession.trim()), "i"));
        }

        // 4. Query theo địa điểm (location)
        if (location != null && !location.trim().isEmpty()) {
            String locTrim = location.trim();
            if ("remote".equalsIgnoreCase(locTrim)) {
                criteriaList.add(Criteria.where("location.remote").is(true));
            } else {
                String locRegex = Pattern.quote(locTrim);
                criteriaList.add(new Criteria().orOperator(
                        Criteria.where("location.city").regex(locRegex, "i"),
                        Criteria.where("location.address").regex(locRegex, "i"),
                        Criteria.where("location.country").regex(locRegex, "i")
                ));
            }
        }

        Criteria combinedCriteria = new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));
        Query query = new Query(combinedCriteria);

        // Đếm tổng số kết quả phù hợp
        long totalElements = mongoTemplate.count(query, Job.class);

        // Phân trang và sắp xếp việc mới nhất lên đầu
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        query.with(pageable);

        List<Job> jobs = mongoTemplate.find(query, Job.class);
        List<JobResponse> responses = jobs.stream().map(this::mapToResponse).toList();

        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean isLast = page >= totalPages - 1 || totalPages == 0;

        return new PageResponse<>(responses, page, size, totalElements, totalPages, isLast);
    }

    public JobResponse getJobById(String id) {
        if (id == null || !ObjectId.isValid(id)) {
            throw new BadRequestException("Job ID không hợp lệ");
        }
        Job job = jobRepository.findById(new ObjectId(id))
                .filter(candidate -> "published".equals(candidate.getStatus()))
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tin tuyển dụng với ID: " + id));
        return mapToResponse(job);
    }

    private JobResponse mapToResponse(Job job) {
        // Keep the search DTO's LocalDateTime contract with an explicit, stable UTC conversion.
        return new JobResponse(
                job.getId() == null ? null : job.getId().toHexString(),
                job.getCompanyId() == null ? null : job.getCompanyId().toHexString(),
                job.getRecruiterId() == null ? null : job.getRecruiterId().toHexString(),
                job.getTitle(),
                job.getDescription(),
                job.getCategory(),
                job.getEmploymentType(),
                job.getLocation(),
                job.getSalary(),
                job.getExperience(),
                job.getRequirements(),
                job.getBenefits(),
                job.getDeadline() == null ? null : LocalDateTime.ofInstant(job.getDeadline(), ZoneOffset.UTC),
                job.getStatus(),
                job.getCreatedAt() == null ? null : LocalDateTime.ofInstant(job.getCreatedAt(), ZoneOffset.UTC)
        );
    }
}
