package com.resumeanalyser.backend.repository;

import com.resumeanalyser.backend.model.Application;
import java.time.Instant;
import java.util.Optional;
import org.bson.types.ObjectId;

public interface ApplicationStatusRepository {
    Optional<Application> updateStatus(ObjectId id, ObjectId jobId, String status,
                                       Instant changedAt, ObjectId changedBy);
}
