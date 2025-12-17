package com.matchme.backend.controller;


import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.RecommendationService;
import com.matchme.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;




@RestController
@RequestMapping("/api/profile")
public class RecommendationController {
    



    private final RecommendationService recommendationService;
    private final UserService userService;


    public RecommendationController(RecommendationService recommendationService, UserService userService) {
        this.recommendationService = recommendationService;
        this.userService = userService;
    }


    //get recommendations

    @GetMapping("/recommendations")
    public ResponseEntity<List<UserProfile>> getRecommendations(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));








        List<UserProfile> profiles = recommendationService.getRecommendations(user);
        return ResponseEntity.ok(profiles);






        



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
