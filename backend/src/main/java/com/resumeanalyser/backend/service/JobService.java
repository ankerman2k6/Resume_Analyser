package com.resumeanalyser.backend.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.JobResponse;
import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.repository.JobRepository;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final MongoTemplate mongoTemplate;

    public JobService(JobRepository jobRepository, MongoTemplate mongoTemplate) {
        this.jobRepository = jobRepository;
        this.mongoTemplate = mongoTemplate;
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
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tin tuyển dụng với ID: " + id));
        return mapToResponse(job);
    }

    private JobResponse mapToResponse(Job job) {
        return new JobResponse(
                job.getId(),
                job.getCompanyId(),
                job.getRecruiterId(),
                job.getTitle(),
                job.getDescription(),
                job.getCategory(),
                job.getEmploymentType(),
                job.getLocation(),
                job.getSalary(),
                job.getExperience(),
                job.getRequirements(),
                job.getBenefits(),
                job.getDeadline(),
                job.getStatus(),
                job.getCreatedAt()
        );
    }
}
