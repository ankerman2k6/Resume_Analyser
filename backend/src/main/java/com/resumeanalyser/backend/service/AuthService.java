package com.resumeanalyser.backend.service;

import java.time.Instant;
import java.time.LocalDateTime;

import org.bson.types.ObjectId;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.LoginRequest;
import com.resumeanalyser.backend.dto.LoginResponse;
import com.resumeanalyser.backend.dto.RegisterRequest;
import com.resumeanalyser.backend.dto.RegisterResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.UnauthorizedException;
import com.resumeanalyser.backend.model.CandidateProfile;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.CandidateProfileRepository;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã tồn tại");
        }

        boolean isRecruiter = "recruiter".equalsIgnoreCase(request.getRole())
                || "hr".equalsIgnoreCase(request.getRole());
        validateRegistration(request, isRecruiter);

        LocalDateTime userNow = LocalDateTime.now();
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(isRecruiter ? "recruiter" : "candidate");
        user.setEmailVerified(false);
        user.setStatus("active");
        user.setCreatedAt(userNow);
        user.setUpdatedAt(userNow);

        User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (DuplicateKeyException exception) {
            throw new ConflictException("Email đã tồn tại");
        }

        ObjectId userId = parseSavedUserId(savedUser);
        Instant now = Instant.now();
        Company savedCompany = null;

        try {
            if (isRecruiter) {
                savedCompany = createCompany(request.getCompany(), now);
                createRecruiterProfile(request, userId, savedCompany.getId(), now);
            } else {
                createCandidateProfile(request, userId, now);
            }
        } catch (RuntimeException exception) {
            if (savedCompany != null) {
                companyRepository.delete(savedCompany);
            }
            userRepository.delete(savedUser);
            throw exception;
        }

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.isEmailVerified(),
                savedUser.getStatus());
    }

    private void validateRegistration(RegisterRequest request, boolean isRecruiter) {
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new BadRequestException("Họ và tên không được để trống.");
        }

        if (isRecruiter && (request.getCompany() == null
                || request.getCompany().getName() == null
                || request.getCompany().getName().isBlank())) {
            throw new BadRequestException("Nhà tuyển dụng phải cung cấp thông tin công ty.");
        }
    }

    private ObjectId parseSavedUserId(User savedUser) {
        if (savedUser.getId() == null || !ObjectId.isValid(savedUser.getId())) {
            throw new BadRequestException("ID tài khoản vừa tạo không hợp lệ.");
        }
        return new ObjectId(savedUser.getId());
    }

    private void createCandidateProfile(RegisterRequest request, ObjectId userId, Instant now) {
        CandidateProfile candidateProfile = new CandidateProfile(
                userId,
                request.getFullName().trim(),
                trim(request.getPhone()),
                trim(request.getAvatarUrl()),
                request.getLocation(),
                now,
                now);
        candidateProfileRepository.save(candidateProfile);
    }

    private Company createCompany(RegisterRequest.CompanyData companyInput, Instant now) {
        Company company = new Company();
        company.setName(companyInput.getName().trim());
        company.setIndustry(trim(companyInput.getIndustry()));
        company.setLogoUrl(trim(companyInput.getLogoUrl()));
        company.setDescription(trim(companyInput.getDescription()));
        company.setSize(trim(companyInput.getSize()));
        company.setWebsite(trim(companyInput.getWebsite()));
        company.setLocations(companyInput.getLocations());
        company.setCreatedAt(now);
        company.setUpdatedAt(now);
        return companyRepository.save(company);
    }

    private void createRecruiterProfile(
            RegisterRequest request,
            ObjectId userId,
            ObjectId companyId,
            Instant now) {
        RecruiterProfile recruiterProfile = new RecruiterProfile();
        recruiterProfile.setUserId(userId);
        recruiterProfile.setCompanyId(companyId);
        recruiterProfile.setFullName(request.getFullName().trim());
        recruiterProfile.setPhone(trim(request.getPhone()));
        recruiterProfile.setPosition(trim(request.getPosition()));
        recruiterProfile.setCreatedAt(now);
        recruiterProfile.setUpdatedAt(now);
        recruiterProfileRepository.save(recruiterProfile);
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
