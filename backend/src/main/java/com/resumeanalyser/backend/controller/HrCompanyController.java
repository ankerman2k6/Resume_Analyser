package com.resumeanalyser.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.service.CompanyLogoReader;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import jakarta.validation.Validator;

import com.resumeanalyser.backend.dto.CompanyResponse;
import com.resumeanalyser.backend.dto.CreateCompanyRequest;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.RegistrationService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hr/company")
public class HrCompanyController {
    private final RegistrationService registration;

    private final ObjectMapper mapper;
    private final Validator validator;

    public HrCompanyController(RegistrationService registration, ObjectMapper mapper, Validator validator) {
        this.registration = registration;
        this.mapper = mapper;
        this.validator = validator;
    }

    @GetMapping
    public ResponseEntity<CompanyResponse> current(@AuthenticationPrincipal User user) {
        return registration.currentCompany(user).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CompanyResponse> create(@AuthenticationPrincipal User user,
            @Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registration.createCompany(user, request, null));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> createWithLogo(@AuthenticationPrincipal User user,
            @RequestPart("company") byte[] company, @RequestPart(value = "logo", required = false) MultipartFile logo) {
        CreateCompanyRequest request;
        try {
            request = mapper.readValue(company, CreateCompanyRequest.class);
        } catch (JacksonException invalidJson) {
            throw new BadRequestException("Thông tin công ty không đúng định dạng JSON.");
        }
        if (request == null) throw new BadRequestException("Thiếu thông tin công ty.");
        if (!validator.validate(request).isEmpty()) throw new BadRequestException("Thông tin công ty chưa hợp lệ.");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registration.createCompany(user, request, CompanyLogoReader.read(logo)));
    }
}
