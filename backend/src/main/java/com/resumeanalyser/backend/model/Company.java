package com.resumeanalyser.backend.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.resumeanalyser.backend.config.ObjectIdStringSerializer;
import tools.jackson.databind.annotation.JsonSerialize;

@Document(collection = "companies")
public class Company {

    @Id
    @JsonSerialize(using = ObjectIdStringSerializer.class)
    private ObjectId id;

    private String name;
    private String industry;
    private String logoUrl;
    private String description;
    private List<Location> locations = new ArrayList<>();
    private String size;
    private String website;
    private Instant createdAt;
    private Instant updatedAt;

    public Company() {
    }

    public Company(String name, String industry, String logoUrl) {
        this.name = name;
        this.industry = industry;
        this.logoUrl = logoUrl;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Location> getLocations() { return locations; }
    public void setLocations(List<Location> locations) {
        this.locations = locations != null ? locations : new ArrayList<>();
    }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static class Location {
        private String address;
        private String city;
        private String country;

        public Location() {}

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }
}
