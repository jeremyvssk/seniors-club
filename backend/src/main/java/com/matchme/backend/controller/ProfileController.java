package com.matchme.backend.controller;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.ProfileResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.FileStorageService;
import com.matchme.backend.service.ProfileService;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(value = "/profile", consumes = "multipart/form-data")
    public ResponseEntity<?> createOrUpdateProfile(
            @AuthenticationPrincipal String email,
            @RequestParam("name") String name,
            @RequestParam("age") Integer age,
            @RequestParam("gender") String gender,
            @RequestParam("hobbies") String hobbiesString,
            @RequestParam("lookingFor") String lookingFor,
            @RequestParam("lookingForGender") String lookingForGender,
            @RequestParam(value = "bio", required = false, defaultValue = "") String bio,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("maxRadiusKm") Integer maxRadiusKm,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
        
        // Step 1: Get user
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Step 2: Build request DTO
        ProfileRequest request = new ProfileRequest();
        request.setName(name);
        request.setAge(age);
        request.setGender(gender);
        request.setHobbies(new ArrayList<>(Arrays.asList(hobbiesString.split(","))));
        request.setLookingFor(lookingFor);
        request.setLookingForGender(lookingForGender);
        request.setBio(bio);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxRadiusKm(maxRadiusKm);
        
        // Step 3: Find or create profile
        UserProfile profile = profileService.findOrCreateProfile(user);
        
        // Step 4: Update fields
        profileService.updateProfileFields(profile, request);
        
        // Step 5: Handle picture if uploaded
        if (profilePicture != null && !profilePicture.isEmpty()) {
            // Delete old picture if exists
            String oldPictureUrl = profile.getProfilePictureUrl();
            if (oldPictureUrl != null) {
                fileStorageService.deleteFile(oldPictureUrl);
            }
            
            // Save new picture
            String newPictureUrl = fileStorageService.saveFile(profilePicture, user.getId());
            profileService.setProfilePicture(profile, newPictureUrl);
        }
        
        // Step 6: Save to database
        UserProfile savedProfile = profileService.saveProfile(profile);
        
        // Step 7: Return response
        ProfileResponse response = profileService.getProfile(user);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProfileResponse profile = profileService.getProfile(user);
        return ResponseEntity.ok(profile);
    }
}