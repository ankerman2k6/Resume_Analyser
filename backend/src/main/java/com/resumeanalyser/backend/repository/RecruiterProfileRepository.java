package com.resumeanalyser.backend.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.RecruiterProfile;

public interface RecruiterProfileRepository extends MongoRepository<RecruiterProfile, ObjectId> {
    Optional<RecruiterProfile> findByUserId(ObjectId userId);
}
