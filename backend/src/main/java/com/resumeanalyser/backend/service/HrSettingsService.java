package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

import org.bson.types.ObjectId;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.HrSettingsResponse;
import com.resumeanalyser.backend.dto.UpdateHrSettingsRequest;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;
import com.resumeanalyser.backend.repository.UserRepository;

@Service
public class HrSettingsService {
    private final RecruiterIdentityService recruiterIdentity;
    private final RecruiterProfileRepository recruiterProfiles;
    private final CompanyRepository companies;
    private final UserRepository users;

    public HrSettingsService(RecruiterIdentityService recruiterIdentity,
            RecruiterProfileRepository recruiterProfiles, CompanyRepository companies,
            UserRepository users) {
        this.recruiterIdentity = recruiterIdentity;
        this.recruiterProfiles = recruiterProfiles;
        this.companies = companies;
        this.users = users;
    }

    public HrSettingsResponse getSettings(User user) {
        RecruiterProfile profile = recruiterIdentity.requireProfile(user);
        Company company = requireCompany(profile);
        return response(user, profile, company);
    }

    public HrSettingsResponse updateSettings(User user, UpdateHrSettingsRequest request) {
        RecruiterProfile profile = recruiterIdentity.requireProfile(user);
        Company company = requireCompany(profile);
        String email = request.profile().email().trim().toLowerCase(Locale.ROOT);
        String userId = user.getId();
        users.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(userId)) {
                throw new ConflictException("Email đã được sử dụng.");
            }
        });

        Instant now = Instant.now();
        profile.setFullName(request.profile().fullName().trim());
        profile.setPhone(trim(request.profile().phone()));
        profile.setPosition(trim(request.profile().position()));
        profile.setUpdatedAt(now);

        company.setName(request.company().name().trim());
        company.setDescription(trim(request.company().description()));
        company.setIndustry(trim(request.company().industry()));
        company.setSize(trim(request.company().size()));
        company.setWebsite(trim(request.company().website()));
        company.setLogoUrl(trim(request.company().logoUrl()));
        List<Company.Location> locations = request.company().locations().stream()
                .map(item -> {
                    Company.Location location = new Company.Location();
                    location.setAddress(item.address().trim());
                    location.setCity(item.city().trim());
                    location.setCountry(item.country().trim());
                    return location;
                }).toList();
        company.setLocations(locations);
        company.setUpdatedAt(now);

        boolean emailChanged = !email.equals(user.getEmail());
        if (emailChanged) {
            user.setEmail(email);
            user.setEmailVerified(false);
            user.setUpdatedAt(LocalDateTime.ofInstant(now, ZoneOffset.UTC));
            try {
                user = users.save(user);
            } catch (DuplicateKeyException ex) {
                throw new ConflictException("Email đã được sử dụng.");
            }
        }
        company = companies.save(company);
        profile = recruiterProfiles.save(profile);
        return response(user, profile, company);
    }

    private Company requireCompany(RecruiterProfile profile) {
        ObjectId companyId = profile.getCompanyId();
        if (companyId == null) {
            throw new NotFoundException("Hồ sơ nhà tuyển dụng chưa liên kết công ty.");
        }
        return companies.findById(companyId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy công ty của nhà tuyển dụng."));
    }

    private static HrSettingsResponse response(User user, RecruiterProfile profile, Company company) {
        List<HrSettingsResponse.Location> locations = company.getLocations() == null
                ? List.of()
                : company.getLocations().stream()
                        .map(location -> new HrSettingsResponse.Location(
                                location.getAddress(), location.getCity(), location.getCountry()))
                        .toList();
        return new HrSettingsResponse(
                new HrSettingsResponse.Profile(profile.getFullName(), user.getEmail(),
                        profile.getPhone(), profile.getPosition()),
                new HrSettingsResponse.Company(company.getName(), company.getDescription(),
                        company.getIndustry(), company.getSize(), company.getWebsite(),
                        company.getLogoUrl(), locations));
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
