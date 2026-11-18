package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.*;

//service giúp kiểm duyệt 
@Service 
public class AdminModerationService {
    private final MongoTemplate mongo;

    public AdminModerationService(MongoTemplate mongo){
        this.mongo = mongo;
    }

    //check id
    private ObjectId parseId(String id) {
        if (id == null || !ObjectId.isValid(id)) {
            throw new BadRequestException("ID không hợp lệ.");
        }
        return new ObjectId(id);
    }


    //tìm công ty dựa trên id
    public Company company(String id) {
        Company company = mongo.findById(parseId(id), Company.class);
        if (company == null) {
            throw new NotFoundException("Không tìm thấy công ty.");
        }
        return company;
    }

    //tìm job dựa trên id
    public Job job(String id) {
        Job job = mongo.findById(parseId(id), Job.class);
        if (job == null) {
            throw new NotFoundException("Không tìm thấy tin tuyển dụng.");
        }
        return job;
    }

    private Query pageQuery(String status, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException("page phải >= 0; size từ 1 đến 100.");
        }

        return Query.query(Criteria.where("status").is(status)).with(PageRequest.of(page, size,
                        Sort.by(Sort.Direction.DESC, "createdAt")
                                .and(Sort.by("_id"))));
    }

    public List<Company> companies(CompanyStatus status, int page, int size){
        return mongo.find(pageQuery(status.name(), page, size), Company.class);
    }

    public List<Job> jobs(String status, int page, int size){
        if(status == null || !List.of("draft", "published", "closed").contains(status) ){
            throw new BadRequestException("Trạng thái tin không hợp lệ");
        }

        return (mongo.find(pageQuery(status, page, size), Job.class));
    }

    //Review company
    public Company reviewCompany(String id, CompanyStatus status){
        if(status != CompanyStatus.failed && status != CompanyStatus.passed){
            throw new BadRequestException("Kết quả duyệt chỉ được là pass hoặc failed");
        }

        company(id); 

        //query cho mongo để tìm ra id company và status đang incheck
        Query query = Query.query(Criteria.where("_id").is(parseId(id)).and("status").is(CompanyStatus.incheck));

        //Updated cái gì và ở đâu
        Update update = new Update().set("status", status).set("updatedAt", Instant.now());

        Company updated = mongo.findAndModify(query,update, FindAndModifyOptions.options().returnNew(true), Company.class);


        if (updated == null) {
            throw new ConflictException("Công ty không còn ở trạng thái chờ duyệt.");
        }

        return updated;
    }

    //Approve jobs

    public Job approveJob(String id){
        Job job = job(id);

        //lấy ra company
        Company company = job.getCompanyId() == null ? null: mongo.findById(job.getCompanyId(), Company.class);

        if (company == null || company.getStatus() != CompanyStatus.passed) {
            throw new ConflictException("Công ty chưa được duyệt.");
        }


        Query query = Query.query(Criteria.where("_id").is(job.getId())
                        .and("status").is("draft")
                        .and("deadline").gt(Instant.now())
                        .and("updatedAt").is(job.getUpdatedAt()));

        Update update = new Update().set("status", "published").set("updatedAt", Instant.now());
        
        Job updated = mongo.findAndModify(query, update,  FindAndModifyOptions.options().returnNew(true), Job.class);

        if (updated == null) {
            throw new ConflictException("Tin đã thay đổi, hết hạn hoặc không còn chờ duyệt.");
        }

        return updated;
    }
}

