package com.resumeanalyser.backend.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.CvTemplate;

public interface CvTemplateRepository extends MongoRepository<CvTemplate, ObjectId> {
    Page<CvTemplate> findByStatus(String status, Pageable pageable);
    Optional<CvTemplate> findByIdAndStatus(ObjectId id, String status);
}
