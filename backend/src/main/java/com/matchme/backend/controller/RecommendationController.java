package com.matchme.backend.controller;


import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.RecommendationService;
import com.matchme.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
public class RecommendationController {
    



    private final RecommendationService recommendationService;
    private final UserService userService;


    public RecommendationController(RecommendationService recommendationService, UserService userService) {
        this.recommendationService = recommendationService;
        this.userService = userService;
    }

    // Return only User IDs (not Profile IDs)
    @GetMapping("/recommendations")
    public ResponseEntity<List<Long>> getRecommendations(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserProfile> profiles = recommendationService.getRecommendations(user);
        
        // Extract USER IDs (the owner of each profile)
        List<Long> userIds = profiles.stream()
            .map(profile -> profile.getUser().getId())  // Changed: get User ID
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(userIds);
    }

    //record likes
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeProfile(
        @AuthenticationPrincipal String email,
        @PathVariable Long id) {
            User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

            recommendationService.likeProfile(user, id);
            return ResponseEntity.ok().build();
        }

    //record skips
    @PostMapping("/{id}/skip")
    public ResponseEntity<?> skipProfile(
        @AuthenticationPrincipal String email,
        @PathVariable Long id) {
            User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

            recommendationService.skipProfile(user, id);
            return ResponseEntity.ok().build();
        }


}
