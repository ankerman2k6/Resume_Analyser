package com.resumeanalyser.backend.model;

import java.time.Instant;
import java.util.List;
import com.resumeanalyser.backend.config.ObjectIdStringSerializer;
import tools.jackson.databind.annotation.JsonSerialize;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "applications")
public class Application {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId jobId;
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId candidateId;
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId cvId;

    private String status;

    private Instant appliedAt;
    private Instant updatedAt;

    private List<StatusChange> statusHistory;

    public List<StatusChange> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusChange> statusHistory) { this.statusHistory = statusHistory; }

    public record StatusChange(String status, Instant changedAt,
            @JsonSerialize(using = ObjectIdStringSerializer.class) ObjectId changedBy, String note) {}

    public Application() {}

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public ObjectId getJobId() {
        return jobId;
    }

    public void setJobId(ObjectId jobId) {
        this.jobId = jobId;
    }

    public ObjectId getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(ObjectId candidateId) {
        this.candidateId = candidateId;
    }

    public ObjectId getCvId() {
        return cvId;
    }

    public void setCvId(ObjectId cvId) {
        this.cvId = cvId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
