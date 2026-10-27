package com.resumeanalyser.backend.dto;

import java.util.List;

public class HrDashboardResponse {

    private long totalOpenJobs;
    private long totalApplications;
    private long interestedCandidates;
    private List<CategoryCount> jobsBySpecialty;
    private List<CategoryCount> jobsByDivision;
    private List<MonthlyApplicationCount> candidateInterestTrend;

    public HrDashboardResponse() {}

    public HrDashboardResponse(long totalOpenJobs, long totalApplications, long interestedCandidates,
                               List<CategoryCount> jobsBySpecialty, List<CategoryCount> jobsByDivision,
                               List<MonthlyApplicationCount> candidateInterestTrend) {
        this.totalOpenJobs = totalOpenJobs;
        this.totalApplications = totalApplications;
        this.interestedCandidates = interestedCandidates;
        this.jobsBySpecialty = jobsBySpecialty;
        this.jobsByDivision = jobsByDivision;
        this.candidateInterestTrend = candidateInterestTrend;
    }

    public static class CategoryCount {
        private String name;
        private long count;

        public CategoryCount() {}

        public CategoryCount(String name, long count) {
            this.name = name;
            this.count = count;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class MonthlyApplicationCount {
        private String month;
        private long applicants;

        public MonthlyApplicationCount() {}

        public MonthlyApplicationCount(String month, long applicants) {
            this.month = month;
            this.applicants = applicants;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public long getApplicants() { return applicants; }
        public void setApplicants(long applicants) { this.applicants = applicants; }
    }

    public long getTotalOpenJobs() { return totalOpenJobs; }
    public void setTotalOpenJobs(long totalOpenJobs) { this.totalOpenJobs = totalOpenJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getInterestedCandidates() { return interestedCandidates; }
    public void setInterestedCandidates(long interestedCandidates) { this.interestedCandidates = interestedCandidates; }

    public List<CategoryCount> getJobsBySpecialty() { return jobsBySpecialty; }
    public void setJobsBySpecialty(List<CategoryCount> jobsBySpecialty) { this.jobsBySpecialty = jobsBySpecialty; }

    public List<CategoryCount> getJobsByDivision() { return jobsByDivision; }
    public void setJobsByDivision(List<CategoryCount> jobsByDivision) { this.jobsByDivision = jobsByDivision; }

    public List<MonthlyApplicationCount> getCandidateInterestTrend() { return candidateInterestTrend; }
    public void setCandidateInterestTrend(List<MonthlyApplicationCount> candidateInterestTrend) {
        this.candidateInterestTrend = candidateInterestTrend;
    }
}
