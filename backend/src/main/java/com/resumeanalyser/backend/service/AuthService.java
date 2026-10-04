package com.resumeanalyser.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.LoginRequest;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtService;
import com.resumeanalyser.backend.dto.LoginResponse;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.UnauthorizedException;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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

    if (!"active".equalsIgnoreCase(user.getStatus())) {
        throw new ForbiddenException("Tài khoản đã bị khóa");
    }

    boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user.getPasswordHash()
    );

    if (!passwordMatches) {
        throw new UnauthorizedException("Sai email hoặc mật khẩu");
    }

    String token = jwtService.generateToken(user);

    return new LoginResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getRole()
    );
}
}
