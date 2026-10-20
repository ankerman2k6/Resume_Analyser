package com.resumeanalyser.backend.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Application;

public interface ApplicationRepository
        extends MongoRepository<Application, ObjectId>, ApplicationStatusRepository {

    // Lấy tất cả đơn ứng tuyển theo Job
    List<Application> findByJobId(ObjectId jobId);

    // Lấy tất cả đơn ứng tuyển của ứng viên
    List<Application> findByCandidateId(ObjectId candidateId);

    // Kiểm tra ứng viên đã ứng tuyển Job chưa
    Optional<Application> findByJobIdAndCandidateId(
            ObjectId jobId,
            ObjectId candidateId
    );

    boolean existsByCvId(ObjectId cvId);
}
