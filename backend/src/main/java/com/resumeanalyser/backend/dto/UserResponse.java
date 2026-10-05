package com.resumeanalyser.backend.dto;

public class UserResponse {

    private String id;
    private String email;
    private String role;
    private boolean emailVerified;
    private String status;

    public UserResponse(
            String id,
            String email,
            String role,
            boolean emailVerified,
            String status) {

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

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public String getStatus() {
        return status;
    }
}
