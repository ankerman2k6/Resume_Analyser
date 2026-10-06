package com.resumeanalyser.backend.service;

import java.time.LocalDateTime;

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

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}

    // Kiểm tra tài khoản , mật khẩu và trạng thái tài khoản, trả về token id email role
    public LoginResponse login(LoginRequest request) {

    User user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() ->
                    new UnauthorizedException("Sai email hoặc mật khẩu")
            );

    boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user.getPasswordHash()
    );

    if (!passwordMatches) {
        throw new UnauthorizedException("Sai email hoặc mật khẩu");
    }

    if (!"active".equalsIgnoreCase(user.getStatus())) {
        throw new ForbiddenException("Tài khoản đã bị khóa");
    }

    String token = jwtService.generateToken(user);

    return new LoginResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getRole()
    );
    }

    public RegisterResponse register(RegisterRequest request) {

    if (userRepository.existsByEmail(request.getEmail())) {
        throw new ConflictException("Email đã tồn tại");
    }

    User user = new User();

    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole("candidate");
     String requestedRole = request.getRole();
        if ("recruiter".equalsIgnoreCase(requestedRole) || "hr".equalsIgnoreCase(requestedRole)) {
            user.setRole("recruiter");
        } else {
            user.setRole("candidate");
        }
    user.setEmailVerified(false);
    user.setStatus("active");

    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());

    User savedUser;
    try {
        savedUser = userRepository.save(user);
    } catch (DuplicateKeyException ex) {
        // Unique index bảo vệ cả hai request đăng ký đồng thời cùng email.
        throw new ConflictException("Email đã tồn tại");
    }

    return new RegisterResponse(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getRole(),
            savedUser.isEmailVerified(),
            savedUser.getStatus()
    );
}
}
