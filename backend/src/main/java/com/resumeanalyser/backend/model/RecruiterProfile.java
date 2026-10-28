package com.resumeanalyser.backend.model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.resumeanalyser.backend.config.ObjectIdStringSerializer;

import tools.jackson.databind.annotation.JsonSerialize;

@Document(collection = "recruiter_profiles")
public class RecruiterProfile {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId userId;

    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId companyId;

    private String fullName;
    private String phone;
    private String position;
    private Instant createdAt;
    private Instant updatedAt;

    public ObjectId getId() { return id; }
    public void setId(ObjectId id) { this.id = id; }

    public ObjectId getUserId() { return userId; }
    public void setUserId(ObjectId userId) { this.userId = userId; }

    public ObjectId getCompanyId() { return companyId; }
    public void setCompanyId(ObjectId companyId) { this.companyId = companyId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
