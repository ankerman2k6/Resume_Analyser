package com.resumeanalyser.backend.dto;

import java.time.LocalDateTime;

public class ResumeResponse {

    private String id;
    private String originalFileName;
    private long fileSize;
    private String contentType;
    private String status;
    private LocalDateTime uploadedAt;

    public ResumeResponse() {
    }

    public ResumeResponse(String id, String originalFileName, long fileSize, String contentType, String status, LocalDateTime uploadedAt) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.status = status;
        this.uploadedAt = uploadedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
