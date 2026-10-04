package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.LoginRequest;
import com.resumeanalyser.backend.dto.LoginResponse;
import com.resumeanalyser.backend.dto.UserResponse;
import com.resumeanalyser.backend.service.AuthService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

import com.resumeanalyser.backend.model.User;

import jakarta.validation.Valid;


@RestController
@RequestMapping("api/auth")
public class AuthController {
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    // api login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {

    User user = (User) authentication.getPrincipal();

        UserResponse response = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.isEmailVerified(),
                user.getStatus()
        );

        return ResponseEntity.ok(response);
}
    
}
