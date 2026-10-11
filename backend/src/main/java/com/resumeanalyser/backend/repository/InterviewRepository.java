package com.resumeanalyser.backend.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Interview;

public interface InterviewRepository
        extends MongoRepository<Interview, ObjectId> {

    List<Interview> findByScheduledByOrderByScheduledAtDesc(
            ObjectId scheduledBy
    );

    List<Interview> findByApplicationIdOrderByScheduledAtDesc(
            ObjectId applicationId
    );

    List<Interview> findByApplicationIdAndScheduledByOrderByScheduledAtDesc(
            ObjectId applicationId,
            ObjectId scheduledBy
    );

    java.util.Optional<Interview> findByIdAndScheduledBy(
            ObjectId id,
            ObjectId scheduledBy
    );
}