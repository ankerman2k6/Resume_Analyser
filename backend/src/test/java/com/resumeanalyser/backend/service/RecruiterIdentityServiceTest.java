package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.UnauthorizedException;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;

@ExtendWith(MockitoExtension.class)
class RecruiterIdentityServiceTest {

    @Mock
    private RecruiterProfileRepository recruiterProfiles;

    private RecruiterIdentityService service;

    @BeforeEach
    void setUp() {
        service = new RecruiterIdentityService(recruiterProfiles);
    }

    @Test
    void resolvesAuthenticatedUserToRecruiterProfileId() {
        ObjectId userId = new ObjectId();
        ObjectId profileId = new ObjectId();
        User user = new User();
        user.setId(userId.toHexString());
        RecruiterProfile profile = new RecruiterProfile();
        profile.setId(profileId);
        profile.setUserId(userId);
        when(recruiterProfiles.findByUserId(userId)).thenReturn(Optional.of(profile));

        assertEquals(profileId, service.requireProfileId(user));
    }

    @Test
    void rejectsInvalidAuthenticatedUserBeforeQueryingMongo() {
        assertThrows(UnauthorizedException.class, () -> service.requireProfileId("invalid"));
        verify(recruiterProfiles, never()).findByUserId(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void recruiterAccountWithoutProfileIsForbidden() {
        ObjectId userId = new ObjectId();
        when(recruiterProfiles.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class, () -> service.requireProfileId(userId.toHexString()));
    }
}
