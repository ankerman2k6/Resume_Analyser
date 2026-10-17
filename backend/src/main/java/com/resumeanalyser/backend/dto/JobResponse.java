package com.resumeanalyser.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.resumeanalyser.backend.model.Job;

public class JobResponse {

    private String id;
    private String companyId;
    private String recruiterId;
    private String title;
    private String description;
    private String category;
    private String employmentType;

    private Job.Location location;
    private Job.Salary salary;
    private Job.Experience experience;
    private Job.Requirements requirements;
    private List<String> benefits;

    private LocalDateTime deadline;
    private String status;
    private LocalDateTime createdAt;

    public JobResponse() {
    }

    public JobResponse(String id, String companyId, String recruiterId, String title, String description,
                       String category, String employmentType, Job.Location location, Job.Salary salary,
                       Job.Experience experience, Job.Requirements requirements, List<String> benefits,
                       LocalDateTime deadline, String status, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.recruiterId = recruiterId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.employmentType = employmentType;
        this.location = location;
        this.salary = salary;
        this.experience = experience;
        this.requirements = requirements;
        this.benefits = benefits;
        this.deadline = deadline;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public Job.Location getLocation() { return location; }
    public void setLocation(Job.Location location) { this.location = location; }

    public Job.Salary getSalary() { return salary; }
    public void setSalary(Job.Salary salary) { this.salary = salary; }

    public Job.Experience getExperience() { return experience; }
    public void setExperience(Job.Experience experience) { this.experience = experience; }

    public Job.Requirements getRequirements() { return requirements; }
    public void setRequirements(Job.Requirements requirements) { this.requirements = requirements; }

    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
