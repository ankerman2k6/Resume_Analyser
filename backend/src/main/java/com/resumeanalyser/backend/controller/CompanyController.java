package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import com.resumeanalyser.backend.model.Company;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.CompanyResponse;
import com.resumeanalyser.backend.service.CompanyService;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<byte[]> getLogo(@PathVariable String id) {
        Company.Logo logo = companyService.getLogo(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(logo.contentType())).body(logo.bytes());
    }

    /** API công khai để xem thông tin công ty gắn với một job. */
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable String id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }
}
