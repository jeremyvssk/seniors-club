package com.matchme.backend.controller;

import com.matchme.backend.dto.BasicUserInfoResponse;
import com.matchme.backend.dto.AboutMeResponse;
import com.matchme.backend.dto.UserBioResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.UserService;
import com.matchme.backend.service.OnlineStatusService;
import com.matchme.backend.service.ProfileService;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private OnlineStatusService onlineStatusService;

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserBasicInfo(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        UserProfile profile = profileService.getProfileByUser(user);
        
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        BasicUserInfoResponse response = new BasicUserInfoResponse();
        response.setId(user.getId());
        response.setName(profile.getName());
        response.setProfilePictureUrl(profile.getProfilePictureUrl());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        UserProfile profile = profileService.getProfileByUser(user);
        
        if (profile == null || !profile.getProfileCompleted()) {
            return ResponseEntity.notFound().build();
        }

        AboutMeResponse response = new AboutMeResponse();
        response.setId(user.getId());
        response.setBio(profile.getBio());
        response.setIsOnline(onlineStatusService.isOnline(id));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}/bio")
    public ResponseEntity<?> getUserBio(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        
        // Get viewer (authenticated user)
        User viewer = null;
        if (email != null) {
            viewer = userService.findByEmail(email).orElse(null);
        }

        // Delegate to service layer (business logic)
        UserProfile profile = userService.getUserBioWithDistance(id, viewer);
        
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        // Map to DTO (controller responsibility)
        UserBioResponse response = new UserBioResponse();
        response.setId(profile.getUser().getId());
        response.setAge(profile.getAge());
        response.setGender(profile.getGender());
        response.setHobbies(profile.getHobbies());
        response.setLookingFor(profile.getLookingFor());
        response.setLookingForGender(profile.getLookingForGender());
        response.setDistanceKm(profile.getDistanceKm());

        return ResponseEntity.ok(response);
    }

    
}