package com.resumeanalyser.backend.dto;

public class LoginResponse {
    private String token;
    private String userId;
    private String email;
    private String role;

    private final boolean needsCompany;
    public boolean isNeedsCompany() { return needsCompany; }

    public LoginResponse(String token, String userId, String email, String role, boolean needsCompany) {
        this.needsCompany = needsCompany;
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
