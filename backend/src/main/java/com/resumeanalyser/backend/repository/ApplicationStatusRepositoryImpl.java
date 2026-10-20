package com.resumeanalyser.backend.repository;

import com.resumeanalyser.backend.model.Application;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

public class ApplicationStatusRepositoryImpl implements ApplicationStatusRepository {
    private final MongoTemplate mongoTemplate;

    public ApplicationStatusRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Optional<Application> updateStatus(ObjectId id, ObjectId jobId, String status,
                                              Instant changedAt, ObjectId changedBy) {
        Query query = Query.query(Criteria.where("_id").is(id).and("jobId").is(jobId));
        Document history = new Document("status", status)
                .append("changedAt", Date.from(changedAt)).append("changedBy", changedBy);
        Update update = new Update().set("status", status).set("updatedAt", changedAt)
                .push("statusHistory", history);
        return Optional.ofNullable(mongoTemplate.findAndModify(query, update,
                FindAndModifyOptions.options().returnNew(true), Application.class));
    }
}
