package com.resumeanalyser.backend.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Company;

public interface CompanyRepository extends MongoRepository<Company, ObjectId> {
}
