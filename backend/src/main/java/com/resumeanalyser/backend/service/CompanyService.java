package com.resumeanalyser.backend.service;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.CompanyResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.repository.CompanyRepository;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyResponse getCompanyById(String id) {
        if (id == null || !ObjectId.isValid(id)) {
            throw new BadRequestException("Company ID không hợp lệ");
        }

        Company company = companyRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new NotFoundException("Không tìm thấy công ty với ID: " + id));

        return mapToResponse(company);
    }

    private CompanyResponse mapToResponse(Company company) {
        List<CompanyResponse.LocationResponse> locations = company.getLocations() == null
                ? List.of()
                : company.getLocations().stream()
                        .map(location -> new CompanyResponse.LocationResponse(
                                location.getAddress(), location.getCity(), location.getCountry()))
                        .toList();

        return new CompanyResponse(
                company.getId() == null ? null : company.getId().toHexString(),
                company.getName(),
                company.getIndustry(),
                company.getLogoUrl(),
                company.getDescription(),
                locations,
                company.getSize(),
                company.getWebsite(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
