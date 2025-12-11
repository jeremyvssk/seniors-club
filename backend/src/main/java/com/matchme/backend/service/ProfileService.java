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
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class ProfileService {

    private final UserProfileRepository profileRepo;

    public ProfileService(UserProfileRepository profileRepo) {
        this.profileRepo = profileRepo;
    }
    //main method to create or update a profile
    @Transactional // ← Ensures database rollback on errors
    public ProfileResponse saveOrUpdateProfile(User user, ProfileRequest request, MultipartFile picture, String uploadedUrl) {

        //checks if the user already exists or not
        Optional<UserProfile> existing = profileRepo.findByUser(user);
        UserProfile profile = existing.orElseGet(UserProfile::new);

        profile.setUser(user);
        profile.setName(request.getName());
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setLocation(request.getLocation());
        profile.setHobbies(request.getHobbies());
        profile.setLookingFor(request.getLookingFor());

        if (uploadedUrl !=null) {
            profile.setProfilePictureUrl(uploadedUrl);
        }

        boolean completed =
        profile.getName() != null &&
        profile.getAge() != null &&
        profile.getGender() != null &&
        profile.getLocation() != null && 
        profile.getHobbies() != null;

        profile.setProfileCompleted(completed);
        //saves the profile to database
        profileRepo.save(profile);
        //returns the info to frontend
        return toResponse(profile);
    }
    //helper method to convert the userprofile to DTO for safety, security etc
    private ProfileResponse toResponse(UserProfile p) {
        ProfileResponse r = new ProfileResponse();
        r.id = p.getId();
        r.name = p.getName();
        r.age = p.getAge();
        r.gender = p.getGender();
        r.location = p.getLocation();
        r.hobbies = p.getHobbies();
        r.lookingFor = p.getLookingFor();
        r.profilePictureUrl = p.getProfilePictureUrl();
        r.profileCompleted = p.isProfileCompleted();
        return r;
    }

    public ProfileResponse getProfile(User user) {
    return profileRepo.findByUser(user)
            .map(this::toResponse)
            .orElse(null);
}

    
}


//create/update profile
//store image
// validate that the user acually owns this profile
// mark profile as complete