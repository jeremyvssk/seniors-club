//Entry point to handle incoming HTTP requests about user profiles
//creating or updating
//calls profileservice to do the actual business logic and returns the 
//profileresponse to user.

package com.matchme.backend.controller;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.ProfileResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.service.FileStorageService;
import com.matchme.backend.service.ProfileService;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    public ProfileController(ProfileService profileService, UserService userService, FileStorageService fileStorageService) {
        this.profileService = profileService;
        this.userService = userService;
        this.fileStorageService = fileStorageService;
    }
    
    @PostMapping("/profile")
    public ResponseEntity<?> createOrUpdateProfile(
            @AuthenticationPrincipal String email,
            @Valid @ModelAttribute ProfileRequest request,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
        
        System.out.println("Received profile request for email: " + email);
        System.out.println("Request data: " + request.getName() + ", " + request.getAge());
        
        // Get the logged-in user
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Initialize uploadedUrl variable
        String uploadedUrl = null;
        
        // Check if user uploaded a file
        if (profilePicture != null && !profilePicture.isEmpty()) {
            // Get existing profile to check for old picture
            ProfileResponse existingProfile = profileService.getProfile(user);
            
            // delete old picture if they hve it
            if (existingProfile != null && existingProfile.profilePictureUrl != null) {
                fileStorageService.deleteFile(existingProfile.profilePictureUrl);
            }
            
            // Save the new picture 
            uploadedUrl = fileStorageService.saveFile(profilePicture, user.getId());
        }
        
        // Save profile data to database (with or without picture URL)
        ProfileResponse response = profileService.saveOrUpdateProfile(
                user,
                request,
                profilePicture,
                uploadedUrl
        );
        
        return ResponseEntity.ok(response);
    }

   @GetMapping("/profile")
    public ProfileResponse getMyProfile(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return profileService.getProfile(user);
    }
}
