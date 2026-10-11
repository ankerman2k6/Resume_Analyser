package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.resumeanalyser.backend.dto.CreateJobRequest;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.JobRepository;

@Service
public class JobService {

    private static final List<String> EMPLOYMENT_TYPES = List.of(
            "full_time", "part_time", "internship", "contract", "freelance");
    private static final Set<String> REQUIREMENT_FIELDS = Set.of(
            "requiredSkills", "preferredSkills", "education", "minimumGpa", "languages");

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // Lấy danh sách Job thuộc HR đang đăng nhập
    public List<Job> getMyJobs(User recruiter) {

        // Kiểm tra ID HR có đúng định dạng MongoDB ObjectId
        if (!ObjectId.isValid(recruiter.getId())) {
            throw new IllegalStateException("HR ID không hợp lệ");
        }

        ObjectId recruiterId = new ObjectId(recruiter.getId());

        // Chỉ lấy Job có recruiterId trùng với HR
        return jobRepository.findByRecruiterId(recruiterId);
    }



    //Tạo job
    public Job createJob(CreateJobRequest request, User recruiter) {

    if (!ObjectId.isValid(recruiter.getId())) {
        throw new IllegalArgumentException("Recruiter ID không hợp lệ");
    }

    if (request.companyId() == null
            || !ObjectId.isValid(request.companyId())) {
        throw new IllegalArgumentException("Company ID không hợp lệ");
    }

    if (request.title() == null
            || request.title().isBlank()) {
        throw new IllegalArgumentException("Title không được để trống");
    }

    if (request.deadline() == null
            || !request.deadline().isAfter(Instant.now())) {
        throw new IllegalArgumentException("Deadline phải ở tương lai");
    }

    validateCreateJobSchema(request);

    //Tạo đối tượng job
    Job job = new Job();

    job.setCompanyId(new ObjectId(request.companyId()));

    // Quan trọng: lấy HR ID từ JWT, không lấy từ request
    job.setRecruiterId(new ObjectId(recruiter.getId()));

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

    private static void validateCreateJobSchema(CreateJobRequest request) {
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

    if (!ObjectId.isValid(recruiter.getId())) {
        throw new IllegalStateException("Recruiter ID không hợp lệ");
    }

    ObjectId id = new ObjectId(jobId);
    ObjectId recruiterId = new ObjectId(recruiter.getId());

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
    ObjectId recruiterId = new ObjectId(recruiter.getId());

    // Chỉ tìm Job thuộc HR đang đăng nhập
    Job job = jobRepository
            .findByIdAndRecruiterId(id, recruiterId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Job not found"
            ));

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

    if (recruiter.getId() == null
            || !ObjectId.isValid(recruiter.getId())) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid recruiter"
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
    ObjectId recruiterId = new ObjectId(recruiter.getId());

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

    if (recruiter.getId() == null ||
            !ObjectId.isValid(recruiter.getId())) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid recruiter"
        );
    }

    ObjectId id = new ObjectId(jobId);
    ObjectId recruiterId = new ObjectId(recruiter.getId());

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
}
