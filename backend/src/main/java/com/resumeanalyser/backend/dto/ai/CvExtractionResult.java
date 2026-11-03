package com.resumeanalyser.backend.dto.ai;

import java.util.List;

public record CvExtractionResult(
                List<Skill> skills,
                List<Experience> experience,
                List<Education> education,
                List<Certificate> certificates) {

        public record Skill(String name, String category, String level, Integer yearsOfExperience) {
        }

        public record Experience(
                        String position,
                        String company,
                        String location,
                        String employmentType,
                        String startDate,
                        String endDate,
                        boolean current,
                        String description,
                        List<String> achievements,
                        List<String> technologies) {
        }

        public record Education(
                        String degree,
                        String major,
                        String institution,
                        String startDate,
                        String endDate,
                        String status,
                        Gpa gpa,
                        String description) {
        }

        public record Gpa(double value, int scale) {
        }

        public record Certificate(
                        String name,
                        String issuer,
                        String issueDate,
                        String credentialId,
                        String credentialUrl,
                        String expirationDate) {
        }
}
