package com.resumeanalyser.backend.service;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.exception.ForbiddenException;
import com.resumeanalyser.backend.exception.UnauthorizedException;
import com.resumeanalyser.backend.model.RecruiterProfile;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.RecruiterProfileRepository;

@Service
public class RecruiterIdentityService {

    private final RecruiterProfileRepository recruiterProfiles;

    public RecruiterIdentityService(RecruiterProfileRepository recruiterProfiles) {
        this.recruiterProfiles = recruiterProfiles;
    }

    public RecruiterProfile requireProfile(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated recruiter is required");
        }
        return requireProfile(user.getId());
    }

    public RecruiterProfile requireProfile(String userId) {
        ObjectId id = requireUserId(userId);
        RecruiterProfile profile = recruiterProfiles.findByUserId(id)
                .orElseThrow(() -> new ForbiddenException(
                        "RECRUITER_PROFILE_REQUIRED",
                        "Tài khoản nhà tuyển dụng chưa có hồ sơ recruiter_profiles."));

        if (profile.getId() == null) {
            throw new ForbiddenException(
                    "RECRUITER_PROFILE_INVALID",
                    "Hồ sơ nhà tuyển dụng không có ID hợp lệ.");
        }
        return profile;
    }

    public ObjectId requireProfileId(User user) {
        return requireProfile(user).getId();
    }

    public ObjectId requireProfileId(String userId) {
        return requireProfile(userId).getId();
    }

    public ObjectId requireUserId(String userId) {
        if (userId == null || !ObjectId.isValid(userId)) {
            throw new UnauthorizedException("Authenticated user ID is invalid");
        }
        return new ObjectId(userId);
    }
}
