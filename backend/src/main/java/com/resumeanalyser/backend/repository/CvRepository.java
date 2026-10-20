package com.resumeanalyser.backend.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Cv;

public interface CvRepository extends MongoRepository<Cv, ObjectId> {
    List<Cv> findByCandidateIdOrderByCreatedAtDesc(ObjectId candidateId);
    Page<Cv> findByCandidateId(ObjectId candidateId, Pageable pageable);
    long countByCandidateId(ObjectId candidateId);
    Optional<Cv> findByIdAndCandidateId(ObjectId id, ObjectId candidateId);
    Optional<Cv> findFirstByCandidateIdOrderByCreatedAtDescIdDesc(ObjectId candidateId);
}
