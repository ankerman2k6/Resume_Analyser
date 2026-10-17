package com.resumeanalyser.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Job;

public interface JobRepository extends MongoRepository<Job, String> {

    List<Job> findByStatus(String status);
}
