//business logic for updating and or creating a profile
//receives the request from controller
//interacts with repository

package com.matchme.backend.service;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final UserProfileRepository profileRepo;

    @Autowired
    private FileStorageService fileStorageService;

    public ProfileService(UserProfileRepository profileRepo) {
        this.profileRepo = profileRepo;
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

    // Parse and validate comma-separated gender preferences
    public List<String> parseAndValidateGenderPreferences(String genderString) {
        if (genderString == null || genderString.trim().isEmpty()) {
            throw new IllegalArgumentException("Gender preferences cannot be empty");
        }

        List<String> validGenders = Arrays.stream(genderString.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(g -> g.equals("man") || g.equals("woman") || g.equals("other"))
                .distinct()
                .collect(Collectors.toList());

        if (validGenders.isEmpty()) {
            throw new IllegalArgumentException("Invalid gender preferences. Must be: man, woman, or other");
        }

        return validGenders;
    }

    // Build ProfileRequest DTO from raw parameters
    public ProfileRequest buildProfileRequest(
            String name,
            Integer age,
            String gender,
            String hobbiesString,
            String lookingFor,
            String lookingForGenderString,
            String bio,
            Double latitude,
            Double longitude,
            Integer maxRadiusKm) {
        
        if (bio != null && bio.length() > 150) {
            throw new IllegalArgumentException("Bio must be no more than 150 characters");
        }

        // Parse and validate gender preferences
        List<String> lookingForGenderList = parseAndValidateGenderPreferences(lookingForGenderString);
        
        // Parse hobbies
        List<String> hobbiesList = Arrays.asList(hobbiesString.split(","));
        
        // Build request DTO
        ProfileRequest request = new ProfileRequest();
        request.setName(name);
        request.setAge(age);
        request.setGender(gender.toLowerCase());
        request.setHobbies(hobbiesList);
        request.setLookingFor(lookingFor);
        request.setLookingForGender(lookingForGenderList);
        request.setBio(bio);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxRadiusKm(maxRadiusKm);
        
        return request;
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

    // Handle profile picture upload
    public void handleProfilePicture(UserProfile profile, MultipartFile profilePicture, Long userId) {
        if (profilePicture != null && !profilePicture.isEmpty()) {
            // Delete old picture if exists
            String oldPictureUrl = profile.getProfilePictureUrl();
            if (oldPictureUrl != null && !oldPictureUrl.isEmpty()) {
                fileStorageService.deleteFile(oldPictureUrl);
            }
            
            // Save new picture
            String newPictureUrl = fileStorageService.saveFile(profilePicture, userId);
            profile.setProfilePictureUrl(newPictureUrl);
        }
    }

        public void deleteProfilePicture(UserProfile profile) {
        String currentPictureUrl = profile.getProfilePictureUrl();
        if (currentPictureUrl != null && !currentPictureUrl.isEmpty()) {
            fileStorageService.deleteFile(currentPictureUrl);
            profile.setProfilePictureUrl(null);
        }
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
    /*
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
        r.profileCompleted = p.getProfileCompleted();
        r.latitude = p.getLatitude();
        r.longitude = p.getLongitude();
        r.maxRadiusKm = p.getMaxRadiusKm();
        return r;
    }
    */
    public UserProfile getProfileByUser(User user) {
        return profileRepo.findByUser(user).orElse(null);
    }
}