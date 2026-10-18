package com.resumeanalyser.backend.model;

import tools.jackson.databind.annotation.JsonSerialize;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import com.resumeanalyser.backend.config.ObjectIdStringSerializer;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "jobs")
public class Job {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId companyId;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId recruiterId;

    private String title;
    private String description;
    private String category;
    private String employmentType;

    private Location location;
    private Salary salary;
    private Experience experience;

    // Keep all requirement fields, including education, GPA and languages.
    private Map<String, Object> requirements;

    private List<String> benefits = new ArrayList<>();

    private Instant deadline;
    private String status;

    private Instant createdAt;
    private Instant updatedAt;

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public ObjectId getCompanyId() {
        return companyId;
    }

    public void setCompanyId(ObjectId companyId) {
        this.companyId = companyId;
    }

    public ObjectId getRecruiterId() {
        return recruiterId;
    }

    public void setRecruiterId(ObjectId recruiterId) {
        this.recruiterId = recruiterId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public Salary getSalary() {
        return salary;
    }

    public void setSalary(Salary salary) {
        this.salary = salary;
    }

    public Experience getExperience() {
        return experience;
    }

    public void setExperience(Experience experience) {
        this.experience = experience;
    }

    public Map<String, Object> getRequirements() {
        return requirements;
    }

    public void setRequirements(Map<String, Object> requirements) {
        this.requirements = requirements;
    }

    public List<String> getBenefits() {
        return benefits;
    }

    public void setBenefits(List<String> benefits) {
        this.benefits = benefits;
    }

    public Instant getDeadline() {
        return deadline;
    }

    public void setDeadline(Instant deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class Location {
        private String address;
        private String city;
        private String country;
        private Boolean remote;

        public Location() {}

        public Location(String address, String city, String country, Boolean remote) {
            this.address = address;
            this.city = city;
            this.country = country;
            this.remote = remote;
        }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        public Boolean getRemote() { return remote; }
        public boolean isRemote() { return Boolean.TRUE.equals(remote); }
        public void setRemote(Boolean remote) { this.remote = remote; }
    }

    public static class Salary {
        private Long min;
        private Long max;
        private String currency;
        private Boolean negotiable;

        public Salary() {}

        public Salary(Long min, Long max, String currency, Boolean negotiable) {
            this.min = min;
            this.max = max;
            this.currency = currency;
            this.negotiable = negotiable;
        }

        public Long getMin() { return min; }
        public void setMin(Long min) { this.min = min; }

        public Long getMax() { return max; }
        public void setMax(Long max) { this.max = max; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public Boolean getNegotiable() { return negotiable; }
        public boolean isNegotiable() { return Boolean.TRUE.equals(negotiable); }
        public void setNegotiable(Boolean negotiable) { this.negotiable = negotiable; }
    }

    public static class Experience {
        private Integer minYears;
        private Integer maxYears;
        private String level;

        public Experience() {}

        public Experience(Integer minYears, Integer maxYears, String level) {
            this.minYears = minYears;
            this.maxYears = maxYears;
            this.level = level;
        }

        public Integer getMinYears() { return minYears; }
        public void setMinYears(Integer minYears) { this.minYears = minYears; }

        public Integer getMaxYears() { return maxYears; }
        public void setMaxYears(Integer maxYears) { this.maxYears = maxYears; }

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
    }

    public static class Requirements {
        private List<String> requiredSkills = new ArrayList<>();
        private List<String> preferredSkills = new ArrayList<>();

        public Requirements() {}

        public Requirements(List<String> requiredSkills, List<String> preferredSkills) {
            this.requiredSkills = requiredSkills != null ? requiredSkills : new ArrayList<>();
            this.preferredSkills = preferredSkills != null ? preferredSkills : new ArrayList<>();
        }

        public List<String> getRequiredSkills() { return requiredSkills; }
        public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

        public List<String> getPreferredSkills() { return preferredSkills; }
        public void setPreferredSkills(List<String> preferredSkills) { this.preferredSkills = preferredSkills; }
    }
}
