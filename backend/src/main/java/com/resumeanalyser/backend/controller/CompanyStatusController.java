package com.resumeanalyser.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.CompanyStatus;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.CompanyAccessService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping ("/api/auth")
public class CompanyStatusController {
    private final CompanyAccessService companyAccess;

    public CompanyStatusController (CompanyAccessService companyAccess){
        this.companyAccess = companyAccess;
    }

    public record CompanyStatusRespone(String companyId, CompanyStatus status) {
    }

    @GetMapping("/company-status")
    public CompanyStatusRespone getStatus(@AuthenticationPrincipal User user) {
        //gọi hàm require
        var company = companyAccess.requireCompany(user);
        return new CompanyStatusRespone(company.getId().toHexString(), company.getStatus());
    }
    
}
