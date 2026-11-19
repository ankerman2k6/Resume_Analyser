package com.resumeanalyser.backend.service;

import java.time.LocalDateTime;
import org.bson.types.ObjectId;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.LoginRequest;
import com.resumeanalyser.backend.dto.LoginResponse;
import com.resumeanalyser.backend.dto.RegisterRequest;
import com.resumeanalyser.backend.dto.RegisterResponse;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.UnauthorizedException;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final RegistrationService registration;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtService jwtService, RegistrationService registration) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.registration = registration;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Sai email hoặc mật khẩu"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Sai email hoặc mật khẩu");
        }
        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new ForbiddenException("Tài khoản đã bị khóa");
        }

        registration.completeCandidateProfile(user);
        boolean needsCompany = "recruiter".equalsIgnoreCase(user.getRole()) && !registration.hasCompany(user);
        return new LoginResponse(jwtService.generateToken(user), user.getId(), user.getEmail(),
                user.getRole(), needsCompany);
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã tồn tại");
        }
        boolean recruiter = "recruiter".equalsIgnoreCase(request.getRole()) || "hr".equalsIgnoreCase(request.getRole());
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(recruiter ? "recruiter" : "candidate");
        user.setEmailVerified(false);
        user.setStatus("active");
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        if (recruiter || request.getFullName() != null || request.getPhone() != null) {
            user.setPendingRegistration(new User.RegistrationDetails(
                    request.getFullName() == null ? "" : request.getFullName(),
                    request.getPhone() == null ? "" : request.getPhone(),
                    new ObjectId(), recruiter ? new ObjectId() : null));
        }
        User saved;
        try {
            saved = userRepository.save(user);
        } catch (DuplicateKeyException ex) {
            throw new ConflictException("Email đã tồn tại");
        }
        registration.completeCandidateProfile(saved);
        return new RegisterResponse(saved.getId(), saved.getEmail(), saved.getRole(),
                saved.isEmailVerified(), saved.getStatus(), jwtService.generateToken(saved));
    }
}
