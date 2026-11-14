package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.resumeanalyser.backend.dto.RegisterRequest;
import com.resumeanalyser.backend.model.CandidateProfile;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.CandidateProfileRepository;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtService;

class AuthServiceRegistrationTest {

    private UserRepository users;
    private CandidateProfileRepository candidateProfiles;
    private RecruiterProfileRepository recruiterProfiles;
    private CompanyRepository companies;
    private AuthService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        candidateProfiles = mock(CandidateProfileRepository.class);
        recruiterProfiles = mock(RecruiterProfileRepository.class);
        companies = mock(CompanyRepository.class);

        service = new AuthService(
                users,
                candidateProfiles,
                recruiterProfiles,
                companies,
                mock(PasswordEncoder.class),
                mock(JwtService.class)
        );

        when(users.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(new ObjectId().toHexString());
            return user;
        });
    }

    @Test
    void candidateRegistrationCreatesUserAndLinkedCandidateProfile() {
        RegisterRequest request = baseRequest("candidate");
        CandidateProfile.Location location = new CandidateProfile.Location();
        location.setAddress("1 Nguyễn Huệ");
        location.setDistrict("Quận 1");
        location.setCity("TP. Hồ Chí Minh");
        location.setCountry("Việt Nam");
        request.setLocation(location);

        service.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        ArgumentCaptor<CandidateProfile> profileCaptor = ArgumentCaptor.forClass(CandidateProfile.class);
        verify(users).save(userCaptor.capture());
        verify(candidateProfiles).save(profileCaptor.capture());

        User user = userCaptor.getValue();
        CandidateProfile profile = profileCaptor.getValue();
        assertEquals(new ObjectId(user.getId()), profile.getUserId());
        assertEquals("Nguyễn Văn A", profile.getFullName());
        assertEquals("Quận 1", profile.getLocation().getDistrict());
    }

    @Test
    void recruiterRegistrationCreatesUserCompanyAndLinkedRecruiterProfile() {
        RegisterRequest request = baseRequest("recruiter");
        request.setPosition("Chuyên viên tuyển dụng");

        Company.Location location = new Company.Location();
        location.setAddress("1 Nguyễn Huệ");
        location.setCity("TP. Hồ Chí Minh");
        location.setCountry("Việt Nam");

        RegisterRequest.CompanyData companyInput = new RegisterRequest.CompanyData();
        companyInput.setName("KONEK");
        companyInput.setIndustry("Công nghệ");
        companyInput.setLocations(List.of(location));
        request.setCompany(companyInput);

        ObjectId companyId = new ObjectId();
        when(companies.save(any(Company.class))).thenAnswer(invocation -> {
            Company company = invocation.getArgument(0);
            company.setId(companyId);
            return company;
        });

        service.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        ArgumentCaptor<RecruiterProfile> profileCaptor = ArgumentCaptor.forClass(RecruiterProfile.class);
        verify(users).save(userCaptor.capture());
        verify(recruiterProfiles).save(profileCaptor.capture());
        verify(companies).save(any(Company.class));

        User user = userCaptor.getValue();
        RecruiterProfile profile = profileCaptor.getValue();
        assertEquals(new ObjectId(user.getId()), profile.getUserId());
        assertEquals(companyId, profile.getCompanyId());
        assertEquals("Chuyên viên tuyển dụng", profile.getPosition());
        assertNotNull(profile.getCreatedAt());
    }

    private RegisterRequest baseRequest(String role) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setPassword("password");
        request.setRole(role);
        request.setFullName("Nguyễn Văn A");
        request.setPhone("0901234567");
        return request;
    }
}
