package com.resumeanalyser.backend.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.CandidateProfile;

public interface CandidateProfileRepository extends MongoRepository<CandidateProfile, ObjectId> {
    Optional<CandidateProfile> findByUserId(ObjectId userId);
    boolean existsByUserId(ObjectId userId);
}
