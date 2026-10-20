package com.resumeanalyser.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.resumeanalyser.backend.config.ObjectIdStringSerializer;
import tools.jackson.databind.annotation.JsonSerialize;

@Document(collection = "cv_analyses")
public class CvAnalysis {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId applicationId;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId cvId;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId jobId;

    private Instant analyzedAt;
    private Scores scores;
    private String recommendation;
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> strengths = new ArrayList<>();
    private List<String> weaknesses = new ArrayList<>();

    public CvAnalysis() {
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public ObjectId getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(ObjectId applicationId) {
        this.applicationId = applicationId;
    }

    public ObjectId getCvId() {
        return cvId;
    }

    public void setCvId(ObjectId cvId) {
        this.cvId = cvId;
    }

    public ObjectId getJobId() {
        return jobId;
    }

    public void setJobId(ObjectId jobId) {
        this.jobId = jobId;
    }

    public Instant getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(Instant analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public Scores getScores() {
        return scores;
    }

    public void setScores(Scores scores) {
        this.scores = scores;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills != null ? matchedSkills : new ArrayList<>();
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths != null ? strengths : new ArrayList<>();
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses != null ? weaknesses : new ArrayList<>();
    }

    public static class Scores {
        private Integer overall;
        private Integer skills;
        private Integer experience;
        private Integer education;
        private Integer projects;
        private Integer certificates;

        public Scores() {
        }

        public Scores(Integer overall, Integer skills, Integer experience, Integer education, Integer projects, Integer certificates) {
            this.overall = overall;
            this.skills = skills;
            this.experience = experience;
            this.education = education;
            this.projects = projects;
            this.certificates = certificates;
        }

        public Integer getOverall() {
            return overall;
        }

        public void setOverall(Integer overall) {
            this.overall = overall;
        }

        public Integer getSkills() {
            return skills;
        }

        public void setSkills(Integer skills) {
            this.skills = skills;
        }

        public Integer getExperience() {
            return experience;
        }

        public void setExperience(Integer experience) {
            this.experience = experience;
        }

        public Integer getEducation() {
            return education;
        }

        public void setEducation(Integer education) {
            this.education = education;
        }

        public Integer getProjects() {
            return projects;
        }

        public void setProjects(Integer projects) {
            this.projects = projects;
        }

        public Integer getCertificates() {
            return certificates;
        }

        public void setCertificates(Integer certificates) {
            this.certificates = certificates;
        }
    }
}
