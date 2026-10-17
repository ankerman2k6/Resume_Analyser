package com.resumeanalyser.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "applications")
public class Application {

    @Id
    private String id;

    private String candidateId;
    private String jobId;
    private String cvId;
    private String status;
    private List<StatusHistory> statusHistory = new ArrayList<>();
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    public Application() {}

    public static class StatusHistory {
        private String status;
        private LocalDateTime changedAt;
        private String changedBy;
        private String note;

        public StatusHistory() {}

        public StatusHistory(String status, LocalDateTime changedAt, String changedBy, String note) {
            this.status = status;
            this.changedAt = changedAt;
            this.changedBy = changedBy;
            this.note = note;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getChangedAt() { return changedAt; }
        public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }

        public String getChangedBy() { return changedBy; }
        public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getCvId() { return cvId; }
    public void setCvId(String cvId) { this.cvId = cvId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<StatusHistory> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistory> statusHistory) { this.statusHistory = statusHistory; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
