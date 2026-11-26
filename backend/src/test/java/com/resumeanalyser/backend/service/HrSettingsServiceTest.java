package com.resumeanalyser.backend.service;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.resumeanalyser.backend.dto.UpdateHrSettingsRequest;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.Company;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.CompanyRepository;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;
import com.resumeanalyser.backend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HrSettingsServiceTest {
    final RecruiterIdentityService identity = mock(RecruiterIdentityService.class);
    final RecruiterProfileRepository profiles = mock(RecruiterProfileRepository.class);
    final CompanyRepository companies = mock(CompanyRepository.class);
    final UserRepository users = mock(UserRepository.class);
    final HrSettingsService service = new HrSettingsService(identity, profiles, companies, users);
    final User user = new User();
    final RecruiterProfile profile = new RecruiterProfile();
    final Company company = new Company();

    @BeforeEach void setup() {
        user.setId(new ObjectId().toHexString());
        user.setEmail("old@example.test");
        user.setEmailVerified(true);
        profile.setId(new ObjectId());
        profile.setUserId(new ObjectId(user.getId()));
        profile.setCompanyId(new ObjectId());
        profile.setFullName("Old name");
        company.setId(profile.getCompanyId());
        company.setName("Old company");
        company.setLocations(List.of());
        when(identity.requireProfile(user)).thenReturn(profile);
        when(companies.findById(profile.getCompanyId())).thenReturn(Optional.of(company));
    }

    @Test void getReadsLinkedProfileUserAndCompany() {
        var result = service.getSettings(user);
        assertEquals("Old name", result.profile().fullName());
        assertEquals("old@example.test", result.profile().email());
        assertEquals("Old company", result.company().name());
        verify(companies).findById(profile.getCompanyId());
        verifyNoInteractions(users);
    }

    @Test void putUpdatesAllThreeCollectionsAndReturnsSavedValues() {
        var request = new UpdateHrSettingsRequest(
                new UpdateHrSettingsRequest.Profile(" New name ", " NEW@EXAMPLE.TEST ", " 0900 ", " HR "),
                new UpdateHrSettingsRequest.Company(" New company ", " About ", " Tech ", " 50 ",
                        " https://example.test ", " https://example.test/logo.png ",
                        List.of(new UpdateHrSettingsRequest.Location(" 1 Street ", " Hanoi ", " Vietnam "))));
        when(users.findByEmail("new@example.test")).thenReturn(Optional.empty());
        when(users.save(user)).thenAnswer(invocation -> invocation.getArgument(0));
        when(companies.save(company)).thenAnswer(invocation -> invocation.getArgument(0));
        when(profiles.save(profile)).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.updateSettings(user, request);

        assertEquals("new@example.test", result.profile().email());
        assertEquals("New name", result.profile().fullName());
        assertEquals("0900", result.profile().phone());
        assertEquals("HR", result.profile().position());
        assertEquals("New company", result.company().name());
        assertEquals("1 Street", result.company().locations().getFirst().address());
        assertFalse(user.isEmailVerified());
        assertNotNull(user.getUpdatedAt());
        assertNotNull(profile.getUpdatedAt());
        assertNotNull(company.getUpdatedAt());
        verify(users).save(user);
        verify(profiles).save(profile);
        verify(companies).save(company);
    }

    @Test void duplicateEmailDoesNotWriteAnyCollection() {
        User other = new User(); other.setId(new ObjectId().toHexString());
        when(users.findByEmail("taken@example.test")).thenReturn(Optional.of(other));
        var request = new UpdateHrSettingsRequest(
                new UpdateHrSettingsRequest.Profile("Name", "taken@example.test", "", ""),
                new UpdateHrSettingsRequest.Company("Company", "", "", "", "", "", List.of()));

        assertThrows(ConflictException.class, () -> service.updateSettings(user, request));
        verify(users, never()).save(any());
        verify(profiles, never()).save(any());
        verify(companies, never()).save(any());
    }

    @Test void missingLinkedCompanyDoesNotWriteAnyCollection() {
        when(companies.findById(profile.getCompanyId())).thenReturn(Optional.empty());
        var request = new UpdateHrSettingsRequest(
                new UpdateHrSettingsRequest.Profile("Name", "new@example.test", "", ""),
                new UpdateHrSettingsRequest.Company("Company", "", "", "", "", "", List.of()));

        assertThrows(NotFoundException.class, () -> service.updateSettings(user, request));
        verify(users, never()).save(any());
        verify(profiles, never()).save(any());
        verify(companies, never()).save(any());
    }
}
