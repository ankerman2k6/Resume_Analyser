package com.resumeanalyser.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.resumeanalyser.backend.config.ObjectIdStringSerializer;
import tools.jackson.databind.annotation.JsonSerialize;

@Document(collection = "cvs")
public class Cv {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId candidateId;

    private String title;
    private Source source;
    private ParseInfo parseInfo;
    private List<Skill> skills = new ArrayList<>();
    private Map<String, Object> personalInfo;
    private String summary;
    private List<Experience> experience = new ArrayList<>();
    private List<Education> education = new ArrayList<>();
    private List<Certificate> certificates = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    public Cv() {
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public ObjectId getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(ObjectId candidateId) {
        this.candidateId = candidateId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }

    public ParseInfo getParseInfo() {
        return parseInfo;
    }

    public void setParseInfo(ParseInfo parseInfo) {
        this.parseInfo = parseInfo;
    }

    public List<Skill> getSkills() {
        return skills;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills != null ? skills : new ArrayList<>();
    }

    public Map<String, Object> getPersonalInfo() {
        return personalInfo;
    }

    public void setPersonalInfo(Map<String, Object> personalInfo) {
        this.personalInfo = personalInfo;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<Experience> getExperience() {
        return experience;
    }

    public void setExperience(List<Experience> experience) {
        this.experience = experience != null ? experience : new ArrayList<>();
    }

    public List<Education> getEducation() {
        return education;
    }

    public void setEducation(List<Education> education) {
        this.education = education != null ? education : new ArrayList<>();
    }

    public List<Certificate> getCertificates() {
        return certificates;
    }

    public void setCertificates(List<Certificate> certificates) {
        this.certificates = certificates != null ? certificates : new ArrayList<>();
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

    public static class Source {
        private String type;
        private String fileName;
        private String fileUrl;
        private String mimeType;

        public Source() {
        }

        public Source(String type, String fileName, String fileUrl, String mimeType) {
            this.type = type;
            this.fileName = fileName;
            this.fileUrl = fileUrl;
            this.mimeType = mimeType;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getMimeType() {
            return mimeType;
        }

        public void setMimeType(String mimeType) {
            this.mimeType = mimeType;
        }
    }

    public static class ParseInfo {
        private String status;
        private Instant parsedAt;
        private String parserVersion;

        public ParseInfo() {
        }

        public ParseInfo(String status, Instant parsedAt, String parserVersion) {
            this.status = status;
            this.parsedAt = parsedAt;
            this.parserVersion = parserVersion;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Instant getParsedAt() {
            return parsedAt;
        }

        public void setParsedAt(Instant parsedAt) {
            this.parsedAt = parsedAt;
        }

        public String getParserVersion() {
            return parserVersion;
        }

        public void setParserVersion(String parserVersion) {
            this.parserVersion = parserVersion;
        }
    }

    public static class Skill {
        private String name;
        private String category;
        private String level;
        private Integer yearsOfExperience;

        public Skill() {
        }

        public Skill(String name, String category, String level, Integer yearsOfExperience) {
            this.name = name;
            this.category = category;
            this.level = level;
            this.yearsOfExperience = yearsOfExperience;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public Integer getYearsOfExperience() {
            return yearsOfExperience;
        }

        public void setYearsOfExperience(Integer yearsOfExperience) {
            this.yearsOfExperience = yearsOfExperience;
        }
    }

    public static class Experience {
        private String position;
        private String company;
        private String location;
        private String employmentType;
        private String startDate;
        private String endDate;
        private Boolean current;
        private String description;
        private List<String> achievements = new ArrayList<>();
        private List<String> technologies = new ArrayList<>();

        public Experience() {
        }

        public String getPosition() {
            return position;
        }

        public void setPosition(String position) {
            this.position = position;
        }

        public String getCompany() {
            return company;
        }

        public void setCompany(String company) {
            this.company = company;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getEmploymentType() {
            return employmentType;
        }

        public void setEmploymentType(String employmentType) {
            this.employmentType = employmentType;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }

        public Boolean getCurrent() {
            return current;
        }

        public void setCurrent(Boolean current) {
            this.current = current;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getAchievements() {
            return achievements;
        }

        public void setAchievements(List<String> achievements) {
            this.achievements = achievements != null ? achievements : new ArrayList<>();
        }

        public List<String> getTechnologies() {
            return technologies;
        }

        public void setTechnologies(List<String> technologies) {
            this.technologies = technologies != null ? technologies : new ArrayList<>();
        }
    }

    public static class Education {
        private String degree;
        private String major;
        private String institution;
        private String startDate;
        private String endDate;
        private String status;
        private Gpa gpa;
        private String description;

        public Education() {
        }

        public String getDegree() {
            return degree;
        }

        public void setDegree(String degree) {
            this.degree = degree;
        }

        public String getMajor() {
            return major;
        }

        public void setMajor(String major) {
            this.major = major;
        }

        public String getInstitution() {
            return institution;
        }

        public void setInstitution(String institution) {
            this.institution = institution;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Gpa getGpa() {
            return gpa;
        }

        public void setGpa(Gpa gpa) {
            this.gpa = gpa;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class Gpa {
        private Double value;
        private Integer scale;

        public Gpa() {
        }

        public Gpa(Double value, Integer scale) {
            this.value = value;
            this.scale = scale;
        }

        public Double getValue() {
            return value;
        }

        public void setValue(Double value) {
            this.value = value;
        }

        public Integer getScale() {
            return scale;
        }

        public void setScale(Integer scale) {
            this.scale = scale;
        }
    }

    public static class Certificate {
        private String name;
        private String issuer;
        private String issueDate;
        private String credentialId;
        private String credentialUrl;
        private String expirationDate;

        public Certificate() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getIssueDate() {
            return issueDate;
        }

        public void setIssueDate(String issueDate) {
            this.issueDate = issueDate;
        }

        public String getCredentialId() {
            return credentialId;
        }

        public void setCredentialId(String credentialId) {
            this.credentialId = credentialId;
        }

        public String getCredentialUrl() {
            return credentialUrl;
        }

        public void setCredentialUrl(String credentialUrl) {
            this.credentialUrl = credentialUrl;
        }

        public String getExpirationDate() {
            return expirationDate;
        }

        public void setExpirationDate(String expirationDate) {
            this.expirationDate = expirationDate;
        }
    }
}
