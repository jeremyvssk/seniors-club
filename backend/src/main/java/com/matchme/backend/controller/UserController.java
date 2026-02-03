package com.matchme.backend.controller;

import com.matchme.backend.dto.BasicUserInfoResponse;
import com.matchme.backend.dto.AboutMeResponse;
import com.matchme.backend.dto.UserBioResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.UserService;
import com.matchme.backend.service.ProfileService;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProfileService profileService;


    // ====== /users/{id} endpoints ======

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserBasicInfo(@PathVariable Long id) {
        // TODO: Add permission check (can only view if recommended/connected)
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        UserProfile profile = profileService.getProfileByUser(user);
        
        // Return 404 if profile doesn't exist
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
        // TODO: Add permission check
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        UserProfile profile = profileService.getProfileByUser(user);
        
        // Return 404 if profile not completed
        if (profile == null || !profile.getProfileCompleted()) {
            return ResponseEntity.notFound().build();
        }

        AboutMeResponse response = new AboutMeResponse();
        response.setId(user.getId());
        response.setBio(profile.getBio());
        response.setAge(profile.getAge());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}/bio")
    public ResponseEntity<?> getUserBio(@PathVariable Long id) {
        // TODO: Add permission check
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        UserProfile profile = profileService.getProfileByUser(user);
        
        // Return 404 if profile not completed
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

    
}