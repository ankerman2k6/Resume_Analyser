package com.resumeanalyser.backend.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
}
