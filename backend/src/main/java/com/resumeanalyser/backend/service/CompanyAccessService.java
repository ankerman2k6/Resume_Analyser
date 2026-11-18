package com.resumeanalyser.backend.service;

import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.CompanyStatus;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.CompanyRepository;

//dùng để accept truy cập company
@Service 
public class CompanyAccessService {
    private final RecruiterIdentityService recruiterIdentity;
    private final CompanyRepository companies;

    public CompanyAccessService(RecruiterIdentityService recruiterIndentity, CompanyRepository companies){
        this.recruiterIdentity = recruiterIndentity;
        this.companies = companies;
    }

    //require company phải liên kết với tài khoản
    public Company requireCompany (User user){
        var profile = recruiterIdentity.requireProfile(user);

        if(profile.getCompanyId() ==null){
            throw new com.resumeanalyser.backend.exception.ForbiddenException("RECRUITER_COMPANY_REQUIRED", "Tài khoản chưa được liên kết với công ty.");
        }

        return companies.findById(profile.getCompanyId()).orElseThrow(
            () -> new com.resumeanalyser.backend.exception.ForbiddenException(
                "RECRUITER_COMPANY_REQUIRED",
                "Không tìm thấy công ty của tài khoản."));
    }

    public boolean isApproved (User user){
        try {
            return requireCompany(user).getStatus() == CompanyStatus.passed;
        } catch (com.resumeanalyser.backend.exception.ForbiddenException e) {
            return false;
        }
    }
}
