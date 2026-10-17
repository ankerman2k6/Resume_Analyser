package com.resumeanalyser.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cvs")
public class CV {

    @Id
    private String id;

    private String candidateId;
    private String templateId;
    private String title;
    private Source source;
    private PersonalInfo personalInfo;
    private String summary;
    private List<Education> education = new ArrayList<>();
    private List<Experience> experience = new ArrayList<>();
    private List<Skill> skills = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private List<Certificate> certificates = new ArrayList<>();
    private List<Language> languages = new ArrayList<>();
    private List<Link> links = new ArrayList<>();
    private ParseInfo parseInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class Source {
        private String type;
        private String fileName;
        private String fileUrl;
        private String mimeType;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getMimeType() { return mimeType; }
        public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    }

    public static class PersonalInfo {
        private String fullName;
        private String email;
        private String phone;
        private Address address;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public Address getAddress() { return address; }
        public void setAddress(Address address) { this.address = address; }
    }

    public static class Address {
        private String address;
        private String city;
        private String country;

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    public static class Education {
        private String institution;
        private String degree;
        private String major;
        private Gpa gpa;
        private String startDate;
        private String endDate;
        private String status;
        private String description;

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }

        public Gpa getGpa() { return gpa; }
        public void setGpa(Gpa gpa) { this.gpa = gpa; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class Gpa {
        private Double value;
        private Integer scale;

        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }

        public Integer getScale() { return scale; }
        public void setScale(Integer scale) { this.scale = scale; }
    }

    public static class Experience {
        private String company;
        private String position;
        private String employmentType;
        private String startDate;
        private String endDate;
        private Boolean current;
        private String location;
        private String description;
        private List<String> technologies = new ArrayList<>();
        private List<String> achievements = new ArrayList<>();

        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }

        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }

        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }

        public Boolean getCurrent() { return current; }
        public void setCurrent(Boolean current) { this.current = current; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<String> getTechnologies() { return technologies; }
        public void setTechnologies(List<String> technologies) { this.technologies = technologies; }

        public List<String> getAchievements() { return achievements; }
        public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    }

    public static class Skill {
        private String name;
        private String category;
        private String level;
        private Integer yearsOfExperience;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }

        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    }

    public static class Project {
        private String name;
        private String description;
        private String role;
        private String startDate;
        private String endDate;
        private List<String> technologies = new ArrayList<>();
        private List<Link> links = new ArrayList<>();
        private List<String> achievements = new ArrayList<>();

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }

        public List<String> getTechnologies() { return technologies; }
        public void setTechnologies(List<String> technologies) { this.technologies = technologies; }

        public List<Link> getLinks() { return links; }
        public void setLinks(List<Link> links) { this.links = links; }

        public List<String> getAchievements() { return achievements; }
        public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    }

    public static class Certificate {
        private String name;
        private String issuer;
        private String issueDate;
        private String expirationDate;
        private String credentialId;
        private String credentialUrl;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getIssuer() { return issuer; }
        public void setIssuer(String issuer) { this.issuer = issuer; }

        public String getIssueDate() { return issueDate; }
        public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

        public String getExpirationDate() { return expirationDate; }
        public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

        public String getCredentialId() { return credentialId; }
        public void setCredentialId(String credentialId) { this.credentialId = credentialId; }

        public String getCredentialUrl() { return credentialUrl; }
        public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
    }

    public static class Language {
        private String name;
        private String level;
        private String certificate;
        private String score;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }

        public String getCertificate() { return certificate; }
        public void setCertificate(String certificate) { this.certificate = certificate; }

        public String getScore() { return score; }
        public void setScore(String score) { this.score = score; }
    }

    public static class Link {
        private String type;
        private String url;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public static class ParseInfo {
        private String status;
        private String parserVersion;
        private LocalDateTime parsedAt;
        private String error;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getParserVersion() { return parserVersion; }
        public void setParserVersion(String parserVersion) { this.parserVersion = parserVersion; }

        public LocalDateTime getParsedAt() { return parsedAt; }
        public void setParsedAt(LocalDateTime parsedAt) { this.parsedAt = parsedAt; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }

    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Source getSource() { return source; }
    public void setSource(Source source) { this.source = source; }

    public PersonalInfo getPersonalInfo() { return personalInfo; }
    public void setPersonalInfo(PersonalInfo personalInfo) { this.personalInfo = personalInfo; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<Education> getEducation() { return education; }
    public void setEducation(List<Education> education) { this.education = education; }

    public List<Experience> getExperience() { return experience; }
    public void setExperience(List<Experience> experience) { this.experience = experience; }

    public List<Skill> getSkills() { return skills; }
    public void setSkills(List<Skill> skills) { this.skills = skills; }

    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { this.projects = projects; }

    public List<Certificate> getCertificates() { return certificates; }
    public void setCertificates(List<Certificate> certificates) { this.certificates = certificates; }

    public List<Language> getLanguages() { return languages; }
    public void setLanguages(List<Language> languages) { this.languages = languages; }

    public List<Link> getLinks() { return links; }
    public void setLinks(List<Link> links) { this.links = links; }

    public ParseInfo getParseInfo() { return parseInfo; }
    public void setParseInfo(ParseInfo parseInfo) { this.parseInfo = parseInfo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
