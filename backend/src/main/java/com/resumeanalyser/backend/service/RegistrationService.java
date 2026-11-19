package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.CompanyResponse;
import com.resumeanalyser.backend.dto.CreateCompanyRequest;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.model.CandidateProfile;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;
import com.resumeanalyser.backend.repository.UserRepository;

@Service
public class RegistrationService {
    private final MongoTemplate mongo;
    private final CompanyRepository companies;
    private final RecruiterProfileRepository recruiters;
    private final UserRepository users;

    public RegistrationService(MongoTemplate mongo, CompanyRepository companies,
            RecruiterProfileRepository recruiters, UserRepository users) {
        this.mongo = mongo;
        this.companies = companies;
        this.recruiters = recruiters;
        this.users = users;
    }

    void completeCandidateProfile(User user) {
        User.RegistrationDetails details = user.getPendingRegistration();
        if (details == null || !"candidate".equals(user.getRole())) return;

        ObjectId userId = new ObjectId(user.getId());
        Instant now = Instant.now();
        Update update = newProfile(details, now)
                .setOnInsert("avatarUrl", "")
                .setOnInsert("location", new CandidateProfile.Location("", ""));
        upsertProfile(userId, update, CandidateProfile.class);
        clearRegistration(user, details);
    }

    private static Update newProfile(User.RegistrationDetails details, Instant now) {
        return new Update().setOnInsert("_id", details.profileId())
                .setOnInsert("fullName", details.fullName()).setOnInsert("phone", details.phone())
                .setOnInsert("createdAt", now).setOnInsert("updatedAt", now);
    }

    private void upsertProfile(ObjectId userId, Update update, Class<?> type) {
        Query owned = Query.query(Criteria.where("userId").is(userId));
        try {
            mongo.upsert(owned, update, type);
        } catch (DuplicateKeyException concurrentInsert) {
            if (mongo.updateFirst(owned, update, type).getMatchedCount() == 0) throw concurrentInsert;
        }
    }

    private void clearRegistration(User user, User.RegistrationDetails details) {
        Query pending = Query.query(Criteria.where("_id").is(user.getId())
                .and("pendingRegistration.profileId").is(details.profileId()));
        mongo.updateFirst(pending, new Update().unset("pendingRegistration"), User.class);
    }

    private Optional<ObjectId> companyId(User user) {
        return recruiters.findByUserId(new ObjectId(user.getId())).map(RecruiterProfile::getCompanyId);
    }

    boolean hasCompany(User user) {
        return companyId(user).isPresent();
    }

    public Optional<CompanyResponse> currentCompany(User user) {
        return companyId(user).map(this::linkedCompany);
    }

    private CompanyResponse linkedCompany(ObjectId id) {
        return companies.findById(id).map(CompanyService::mapToResponse)
                .orElseThrow(() -> new ConflictException("Không tìm thấy công ty đã liên kết với hồ sơ."));
    }

    public CompanyResponse createCompany(User user, CreateCompanyRequest request, Company.Logo uploadedLogo) {
        Optional<CompanyResponse> existing = currentCompany(user);
        User.RegistrationDetails details = user.getPendingRegistration();
        if (existing.isPresent()) {
            if (details != null) clearRegistration(user, details);
            return existing.get();
        }

        if (details == null) {
            // Accounts created by older clients may have no profile or registration details.
            Query missing = Query.query(Criteria.where("_id").is(user.getId()).and("pendingRegistration").is(null));
            User.RegistrationDetails reservation = new User.RegistrationDetails("", "", new ObjectId(), new ObjectId());
            User reserved = mongo.findAndModify(missing, new Update().set("pendingRegistration", reservation),
                    FindAndModifyOptions.options().returnNew(true), User.class);
            if (reserved == null) reserved = users.findById(user.getId()).orElseThrow();
            details = reserved.getPendingRegistration();
            existing = currentCompany(user);
            if (existing.isPresent()) {
                if (details != null) clearRegistration(user, details);
                return existing.get();
            }
        }
        if (details == null || details.companyId() == null) {
            throw new ConflictException("Vui lòng thử lại thao tác tạo công ty.");
        }

        Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        // The account reserves both IDs. Retrying between these writes reuses the first company.
        Company company = new Company();
        company.setId(details.companyId());
        company.setName(request.name().trim());
        company.setDescription(request.description().trim());
        company.setIndustry(request.industry().trim());
        company.setSize(request.size().trim());
        company.setWebsite(request.website() == null ? "" : request.website().trim());
        company.setUploadedLogo(uploadedLogo);
        if (uploadedLogo != null) {
            company.setLogoUrl("/api/companies/" + company.getId().toHexString() + "/logo");
        } else {
            company.setLogoUrl(request.logoUrl() == null ? "" : request.logoUrl().trim());
        }
        company.setLocations(request.locations().stream().map(input -> {
            Company.Location location = new Company.Location();
            location.setAddress(input.address().trim());
            location.setCity(input.city().trim());
            location.setCountry(input.country().trim());
            return location;
        }).toList());
        company.setStatus("passed");
        company.setCreatedAt(now);
        company.setUpdatedAt(now);
        try {
            companies.insert(company);
        } catch (DuplicateKeyException concurrentInsert) {
            company = companies.findById(details.companyId()).orElseThrow(() -> concurrentInsert);
        }
        Update update = newProfile(details, now).setOnInsert("position", "").set("companyId", company.getId());
        upsertProfile(new ObjectId(user.getId()), update, RecruiterProfile.class);
        clearRegistration(user, details);
        return CompanyService.mapToResponse(company);
    }
}
