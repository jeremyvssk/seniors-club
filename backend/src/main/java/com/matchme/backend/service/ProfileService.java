//business logic for updating and or creating a profile
//receives the request from controller
//interacts with repository
//saves/udpates database and returns response

package com.matchme.backend.service;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.ProfileResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    private final UserProfileRepository profileRepo;

    public ProfileService(UserProfileRepository profileRepo) {
        this.profileRepo = profileRepo;
    }

    // get the profile, nothing else
    public ProfileResponse getProfile(User user) {
        return profileRepo.findByUser(user)
                .map(this::toResponse)
                .orElse(null);
    }

    // find existing profile or create new one
    public UserProfile findOrCreateProfile(User user) {
        return profileRepo.findByUser(user)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });
    }

    // update profile fields from request
    public void updateProfileFields(UserProfile profile, ProfileRequest request) {
        profile.setName(request.getName());
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setHobbies(request.getHobbies());
        profile.setLookingFor(request.getLookingFor());
        profile.setLookingForGender(request.getLookingForGender());
        profile.setBio(request.getBio());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        profile.setMaxRadiusKm(request.getMaxRadiusKm());
    }

    // set the picture URL
    public void setProfilePicture(UserProfile profile, String pictureUrl) {
        profile.setProfilePictureUrl(pictureUrl);
    }

    // check if profile is complete
    public boolean isProfileComplete(UserProfile profile) {
        return profile.getName() != null &&
               profile.getAge() != null &&
               profile.getGender() != null &&
               profile.getHobbies() != null &&
               profile.getLookingFor() != null &&
               profile.getLookingForGender() != null &&
               profile.getLatitude() != null &&
               profile.getLongitude() != null &&
               profile.getMaxRadiusKm() != null;
    }

    // save to database
    @Transactional
    public UserProfile saveProfile(UserProfile profile) {
        profile.setProfileCompleted(isProfileComplete(profile));
        return profileRepo.save(profile);
    }

    // convert to response DTO
    private ProfileResponse toResponse(UserProfile p) {
        ProfileResponse r = new ProfileResponse();
        r.id = p.getId();
        r.name = p.getName();
        r.age = p.getAge();
        r.gender = p.getGender();
        r.hobbies = p.getHobbies();
        r.lookingFor = p.getLookingFor();
        r.lookingForGender = p.getLookingForGender();
        r.bio = p.getBio();
        r.profilePictureUrl = p.getProfilePictureUrl();
        r.profileCompleted = p.isProfileCompleted();
        r.latitude = p.getLatitude();
        r.longitude = p.getLongitude();
        r.maxRadiusKm = p.getMaxRadiusKm();
        return r;
    }
}