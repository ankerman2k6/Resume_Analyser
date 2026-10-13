package com.resumeanalyser.backend.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.resumeanalyser.backend.model.Job;

public interface JobRepository extends MongoRepository<Job, ObjectId> {

    // Lấy tất cả Jobs thuộc HR đang đăng nhập
    List<Job> findByRecruiterId(ObjectId recruiterId);

    // Tìm Job theo ID và kiểm tra HR sở hữu
    Optional<Job> findByIdAndRecruiterId(
            ObjectId id,
            ObjectId recruiterId
    );

    // Lấy Jobs theo trạng thái của HR
    List<Job> findByRecruiterIdAndStatus(
            ObjectId recruiterId,
            String status
    );
}