package com.resumeanalyser.backend.service.ai;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.resumeanalyser.backend.dto.ai.CvExtractionResult;
import com.resumeanalyser.backend.model.Cv;

@Component
public class CvExtractionMapper {

    private static final int MAX_SKILLS = 100;
    private static final int MAX_EXPERIENCE = 50;
    private static final int MAX_EDUCATION = 30;
    private static final int MAX_CERTIFICATES = 50;
    private static final int MAX_LIST_ITEMS = 100;

    public NormalizedCvData normalize(CvExtractionResult source) {
        if (source == null) {
            throw new IllegalArgumentException("Kết quả trích xuất CV không được null.");
        }
        return new NormalizedCvData(
                mapSkills(source.skills()),
                mapExperience(source.experience()),
                mapEducation(source.education()),
                mapCertificates(source.certificates()));
    }

    private List<Cv.Skill> mapSkills(List<CvExtractionResult.Skill> input) {
        List<Cv.Skill> output = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (CvExtractionResult.Skill item : safe(input)) {
            if (item == null || clean(item.name()).isBlank() || output.size() >= MAX_SKILLS) {
                continue;
            }
            String name = clean(item.name());
            if (!seen.add(name.toLowerCase(Locale.ROOT))) {
                continue;
            }
            Integer years = item.yearsOfExperience();
            if (years != null && years < 0) {
                years = null;
            }
            output.add(new Cv.Skill(name, clean(item.category()), optional(item.level()), years));
        }
        return output;
    }

    private List<Cv.Experience> mapExperience(List<CvExtractionResult.Experience> input) {
        List<Cv.Experience> output = new ArrayList<>();
        for (CvExtractionResult.Experience item : safe(input)) {
            if (item == null || output.size() >= MAX_EXPERIENCE) {
                continue;
            }
            String position = clean(item.position());
            String company = clean(item.company());
            if (position.isBlank() && company.isBlank()) {
                continue;
            }
            Cv.Experience mapped = new Cv.Experience();
            mapped.setPosition(position);
            mapped.setCompany(company);
            mapped.setLocation(clean(item.location()));
            mapped.setEmploymentType(clean(item.employmentType()));
            mapped.setStartDate(clean(item.startDate()));
            mapped.setEndDate(optional(item.endDate()));
            mapped.setCurrent(item.current());
            mapped.setDescription(clean(item.description()));
            mapped.setAchievements(cleanList(item.achievements()));
            mapped.setTechnologies(cleanList(item.technologies()));
            output.add(mapped);
        }
        return output;
    }

    private List<Cv.Education> mapEducation(List<CvExtractionResult.Education> input) {
        List<Cv.Education> output = new ArrayList<>();
        for (CvExtractionResult.Education item : safe(input)) {
            if (item == null || output.size() >= MAX_EDUCATION) {
                continue;
            }
            String degree = clean(item.degree());
            String major = clean(item.major());
            String institution = clean(item.institution());
            if (degree.isBlank() && major.isBlank() && institution.isBlank()) {
                continue;
            }
            Cv.Education mapped = new Cv.Education();
            mapped.setDegree(degree);
            mapped.setMajor(major);
            mapped.setInstitution(institution);
            mapped.setStartDate(clean(item.startDate()));
            mapped.setEndDate(clean(item.endDate()));
            mapped.setStatus(clean(item.status()));
            mapped.setDescription(optional(item.description()));
            if (validGpa(item.gpa())) {
                mapped.setGpa(new Cv.Gpa(item.gpa().value(), item.gpa().scale()));
            }
            output.add(mapped);
        }
        return output;
    }

    private List<Cv.Certificate> mapCertificates(List<CvExtractionResult.Certificate> input) {
        List<Cv.Certificate> output = new ArrayList<>();
        for (CvExtractionResult.Certificate item : safe(input)) {
            if (item == null || clean(item.name()).isBlank() || output.size() >= MAX_CERTIFICATES) {
                continue;
            }
            Cv.Certificate mapped = new Cv.Certificate();
            mapped.setName(clean(item.name()));
            mapped.setIssuer(clean(item.issuer()));
            mapped.setIssueDate(clean(item.issueDate()));
            mapped.setCredentialId(clean(item.credentialId()));
            mapped.setCredentialUrl(optional(item.credentialUrl()));
            mapped.setExpirationDate(optional(item.expirationDate()));
            output.add(mapped);
        }
        return output;
    }

    private boolean validGpa(CvExtractionResult.Gpa gpa) {
        return gpa != null && Double.isFinite(gpa.value()) && gpa.scale() > 0
                && gpa.value() >= 0 && gpa.value() <= gpa.scale();
    }

    private List<String> cleanList(List<String> input) {
        List<String> output = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (String value : safe(input)) {
            String cleaned = clean(value);
            if (!cleaned.isBlank() && seen.add(cleaned.toLowerCase(Locale.ROOT))) {
                output.add(cleaned);
                if (output.size() >= MAX_LIST_ITEMS) {
                    break;
                }
            }
        }
        return output;
    }

    private String clean(String value) {
        return value == null ? "" : value.strip().replaceAll("\\s+", " ");
    }

    private String optional(String value) {
        String cleaned = clean(value);
        return cleaned.isBlank() ? null : cleaned;
    }

    private <T> List<T> safe(List<T> input) {
        return input == null ? List.of() : input;
    }

    public record NormalizedCvData(
            List<Cv.Skill> skills,
            List<Cv.Experience> experience,
            List<Cv.Education> education,
            List<Cv.Certificate> certificates) {}
}
