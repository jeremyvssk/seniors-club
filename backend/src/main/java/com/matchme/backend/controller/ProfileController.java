package com.matchme.backend.controller;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.ProfileResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.ProfileService;
import com.matchme.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    @PostMapping(value = "/profile", consumes = "multipart/form-data")
    public ResponseEntity<?> createOrUpdateProfile(
            @AuthenticationPrincipal String email,
            @RequestParam("name") String name,
            @RequestParam("age") Integer age,
            @RequestParam("gender") String gender,
            @RequestParam("hobbies") String hobbiesString,
            @RequestParam("lookingFor") String lookingFor,
            @RequestParam("lookingForGender") String lookingForGenderString,
            @RequestParam(value = "bio", required = false, defaultValue = "") String bio,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("maxRadiusKm") Integer maxRadiusKm,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
        
        try {
            // Step 1: Get user
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Step 2: Build request DTO
            ProfileRequest request = profileService.buildProfileRequest(
                name, age, gender, hobbiesString, lookingFor,
                lookingForGenderString, bio, latitude, longitude, maxRadiusKm
            );
            
            // Step 3: Find or create profile
            UserProfile profile = profileService.findOrCreateProfile(user);
            
            // Step 4: Update fields
            profileService.updateProfileFields(profile, request);
            
            // Step 5: Handle picture upload
            profileService.handleProfilePicture(profile, profilePicture, user.getId());
            
            // Step 6: Save to database
            profileService.saveProfile(profile);
            
            // Step 7: Return response
            ProfileResponse response = profileService.getProfile(user);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while updating profile");
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = profileService.getProfileByUser(user);
        if (profile == null || !profile.getProfileCompleted()) {
            return ResponseEntity.notFound().build();
        }
        
        // Return only "about me" info
        AboutMeResponse response = new AboutMeResponse();
        response.setId(user.getId());
        response.setBio(profile.getBio());
        response.setAge(profile.getAge());
        
        return ResponseEntity.ok(response);
    }
}