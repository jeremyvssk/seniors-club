package com.matchme.backend.controller;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.ProfileResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.service.FileStorageService;
import com.matchme.backend.service.ProfileService;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
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

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(value = "/profile", consumes = "multipart/form-data")
    public ResponseEntity<?> createOrUpdateProfile(
            @AuthenticationPrincipal String email,
            @Valid @ModelAttribute ProfileRequest request,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
        
        System.out.println("=== CREATING PROFILE ===");
        System.out.println("Email: " + email);
        System.out.println("Name: " + request.getName());
        System.out.println("Age: " + request.getAge());
        System.out.println("Gender: " + request.getGender());
        System.out.println("Has picture: " + (profilePicture != null && !profilePicture.isEmpty()));
        
        // Get the logged-in user
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Initialize uploadedUrl variable
        String uploadedUrl = null;
        
        // Check if user uploaded a file
        if (profilePicture != null && !profilePicture.isEmpty()) {
            System.out.println("Processing picture upload...");
            
            // Get existing profile to check for old picture
            ProfileResponse existingProfile = profileService.getProfile(user);
            
            // Delete old picture if they have it
            if (existingProfile != null && existingProfile.profilePictureUrl != null) {
                fileStorageService.deleteFile(existingProfile.profilePictureUrl);
            }
            
            // Save the new picture to /uploads/ folder and get URL
            uploadedUrl = fileStorageService.saveFile(profilePicture, user.getId());
            System.out.println("Picture saved at: " + uploadedUrl);
        } else {
            System.out.println("No picture uploaded");
        }
        
        // Save profile data to database (JSON data + URL)
        ProfileResponse response = profileService.saveOrUpdateProfile(
                user,
                request,        // JSON data
                profilePicture, // File (for validation)
                uploadedUrl     // URL string → This goes to database!
        );
        
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