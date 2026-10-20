package com.resumeanalyser.backend.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.CvAnalysis;

public interface CvAnalysisRepository extends MongoRepository<CvAnalysis, ObjectId> {
    List<CvAnalysis> findByApplicationIdOrderByAnalyzedAtDescIdDesc(ObjectId applicationId);
    boolean existsByCvId(ObjectId cvId);
}
