package com.matchme.backend.controller;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.UserBioResponse;
import com.matchme.backend.dto.BasicUserInfoResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.ProfileService;
import com.matchme.backend.service.UserService;
import com.matchme.backend.dto.ProfileUpdateRequest;
import com.matchme.backend.dto.AboutMeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.Map;

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
                    lookingForGenderString, bio, latitude, longitude, maxRadiusKm);

            // Step 3: Find or create profile
            UserProfile profile = profileService.findOrCreateProfile(user);

            // Step 4: Update fields
            profileService.updateProfileFields(profile, request);

            // Step 5: Handle picture upload
            profileService.handleProfilePicture(profile, profilePicture, user.getId());

            // Step 6: Save to database
            profileService.saveProfile(profile);

            // Return simple success message and user id
            return ResponseEntity.ok(Map.of(
                    "message", "Profile created successfully",
                    "userId", user.getId()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while updating profile");
        }
    }

    // Shortcut to /api/users/{id} for authenticated user
    @GetMapping("")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileService.getProfileByUser(user);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        BasicUserInfoResponse response = new BasicUserInfoResponse();
        response.setId(user.getId());
        response.setName(profile.getName());
        // Always set profilePictureUrl, even if null
        response.setProfilePictureUrl(profile.getProfilePictureUrl() != null ? profile.getProfilePictureUrl() : null);

        return ResponseEntity.ok(response);
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
        response.setName(profile.getName() != null ? profile.getName() : "");
        response.setAge(profile.getAge() != null ? profile.getAge() : 0);
        response.setBio(profile.getBio() != null ? profile.getBio() : "");
        response.setHobbies(profile.getHobbies() != null ? profile.getHobbies() : new ArrayList<>());
        response.setLookingFor(profile.getLookingFor() != null ? profile.getLookingFor() : "");
        response.setProfilePictureUrl(profile.getProfilePictureUrl() != null ? profile.getProfilePictureUrl() : "");
        response.setMaxRadiusKm(profile.getMaxRadiusKm() != null ? profile.getMaxRadiusKm() : 50);
        return ResponseEntity.ok(response);
    }

    // Get MY biographical data
    @GetMapping("/bio")
    public ResponseEntity<?> getMyBio(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileService.getProfileByUser(user);
        if (profile == null || !profile.getProfileCompleted()) {
            return ResponseEntity.notFound().build();
        }

        UserBioResponse response = new UserBioResponse();
        response.setId(user.getId());
        response.setGender(profile.getGender());
        response.setHobbies(profile.getHobbies());
        response.setLookingFor(profile.getLookingFor());
        response.setLookingForGender(profile.getLookingForGender());
        response.setLatitude(profile.getLatitude());
        response.setLongitude(profile.getLongitude());
        response.setMaxRadiusKm(profile.getMaxRadiusKm());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/edit")
    public ResponseEntity<?> getMyProfileForEdit(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileService.getProfileByUser(user);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        // Return all editable fields
        return ResponseEntity.ok(Map.of(

                "name", profile.getName() != null ? profile.getName() : "",
                "age", profile.getAge() != null ? profile.getAge() : 0,
                "hobbies", profile.getHobbies() != null ? profile.getHobbies() : java.util.List.of(),
                "lookingFor", profile.getLookingFor() != null ? profile.getLookingFor() : "",
                "lookingForGender",
                profile.getLookingForGender() != null ? profile.getLookingForGender() : java.util.List.of(),
                "bio", profile.getBio() != null ? profile.getBio() : "",
                "maxRadiusKm", profile.getMaxRadiusKm() != null ? profile.getMaxRadiusKm() : 50,
                "profilePictureUrl", profile.getProfilePictureUrl()));
    }

    // update profile picture only

    @PutMapping(value = "/profile/picture", consumes = "multipart/form-data")
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal String email,
            @RequestParam("profilePicture") MultipartFile profilePicture) {

        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserProfile profile = profileService.getProfileByUser(user);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }

            // Upload new picture
            profileService.handleProfilePicture(profile, profilePicture, user.getId());
            profileService.saveProfile(profile);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile picture updated successfully",
                    "profilePictureUrl", profile.getProfilePictureUrl()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to update profile picture");
        }
    }

    // DELETE profile picture

    @DeleteMapping("/profile/picture")
    public ResponseEntity<?> deleteProfilePicture(@AuthenticationPrincipal String email) {
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserProfile profile = profileService.getProfileByUser(user);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }

            profileService.deleteProfilePicture(profile); // No userId needed
            profileService.saveProfile(profile);

            return ResponseEntity.ok(Map.of("message", "Profile picture deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to delete profile picture");
        }
    }

    // Update only provided fields

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody ProfileUpdateRequest updates) {

        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserProfile profile = profileService.getProfileByUser(user);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }

            if (updates.getName() != null) {
                profile.setName(updates.getName().trim());
            }
            if (updates.getBio() != null) {
                profile.setBio(updates.getBio());
            }
            if (updates.getHobbies() != null) {
                profile.setHobbies(updates.getHobbies());
            }
            if (updates.getLookingFor() != null) {
                profile.setLookingFor(updates.getLookingFor());
            }
            if (updates.getLookingForGender() != null) {
                profile.setLookingForGender(updates.getLookingForGender());
            }
            if (updates.getMaxRadiusKm() != null) {
                profile.setMaxRadiusKm(updates.getMaxRadiusKm());
            }

            profileService.saveProfile(profile);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to update profile");
        }
    }
}
