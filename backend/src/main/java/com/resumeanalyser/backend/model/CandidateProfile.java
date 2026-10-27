package com.resumeanalyser.backend.model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.resumeanalyser.backend.config.ObjectIdStringSerializer;
import tools.jackson.databind.annotation.JsonSerialize;

@Document(collection = "candidate_profiles")
public class CandidateProfile {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    @Indexed(unique = true)
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId userId;

    private String fullName;
    private String phone;
    private String avatarUrl;
    private Location location;

    private Instant createdAt;
    private Instant updatedAt;

    public CandidateProfile() {
    }

    public CandidateProfile(ObjectId userId, String fullName, String phone, String avatarUrl, Location location, Instant createdAt, Instant updatedAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.location = location;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public ObjectId getUserId() {
        return userId;
    }

    public void setUserId(ObjectId userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
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
        private String district;

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        private String city;
        private String country;

        public Location() {
        }

        public Location(String city, String country) {
            this.city = city;
            this.country = country;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }
}
