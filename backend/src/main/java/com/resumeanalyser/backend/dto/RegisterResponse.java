package com.resumeanalyser.backend.dto;

public class RegisterResponse {

    private String id;
    private String email;
    private String role;
    private boolean emailVerified;
    private String status;

    private final String token;
    public String getToken() { return token; }

    public RegisterResponse(String id, String email, String role, boolean emailVerified, String status, String token) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
        this.emailVerified = emailVerified;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }
}
