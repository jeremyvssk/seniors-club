package com.matchme.backend.controller;

import com.matchme.backend.dto.LikeRequest;
import com.matchme.backend.dto.LikeResponse;
import com.matchme.backend.dto.MatchedUserResponse;
import com.matchme.backend.model.Match;
import com.matchme.backend.model.User;
import com.matchme.backend.service.MatchService;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private UserService userService;

    // Like a user
    @PostMapping("/like")
    public ResponseEntity<LikeResponse> likeUser(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody LikeRequest request) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = matchService.likeUser(currentUser.getId(), request.getLikedUserId());

        LikeResponse response = new LikeResponse();
        if (match.getIsMatch()) {
            response.setMessage("It's a match! 🎉");
            response.setIsMatch(true);
            response.setMatchId(match.getId());
        } else {
            response.setMessage("Like sent!");
            response.setIsMatch(false);
            response.setMatchId(match.getId());
        }

        return ResponseEntity.ok(response);
    }

    // Unlike a user
    @DeleteMapping("/unlike/{likedUserId}")
    public ResponseEntity<Void> unlikeUser(
            @AuthenticationPrincipal String email,
            @PathVariable Long likedUserId) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        matchService.unlikeUser(currentUser.getId(), likedUserId);

        return ResponseEntity.ok().build();
    }

    // Get all matches
    @GetMapping
    public ResponseEntity<List<MatchedUserResponse>> getUserMatches(
            @AuthenticationPrincipal String email) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MatchedUserResponse> matches = matchService.getUserMatches(currentUser.getId());

        return ResponseEntity.ok(matches);
    }

    // Check if user has liked another user
    @GetMapping("/check/{likedUserId}")
    public ResponseEntity<Boolean> hasUserLiked(
            @AuthenticationPrincipal String email,
            @PathVariable Long likedUserId) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasLiked = matchService.hasUserLiked(currentUser.getId(), likedUserId);

        return ResponseEntity.ok(hasLiked);
    }
}