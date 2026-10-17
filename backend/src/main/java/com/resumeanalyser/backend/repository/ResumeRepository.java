package com.resumeanalyser.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Resume;

public interface ResumeRepository extends MongoRepository<Resume, String> {

    List<Resume> findByUserIdOrderByUploadedAtDesc(String userId);

    Optional<Resume> findByIdAndUserId(String id, String userId);
}
