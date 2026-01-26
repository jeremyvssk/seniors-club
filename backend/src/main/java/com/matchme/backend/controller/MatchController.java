package com.matchme.backend.controller;

import com.matchme.backend.dto.*;
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
@RequestMapping("/api/matches")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private UserService userService;

    // Send connection request (like)
    @PostMapping("/request")
    public ResponseEntity<LikeResponse> sendConnectionRequest(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody LikeRequest request) {
        
        System.out.println("Connection request from: " + email + " to user: " + request.getLikedUserId());
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = matchService.sendConnectionRequest(currentUser.getId(), request.getLikedUserId());

        LikeResponse response = new LikeResponse(
            "Connection request sent!",
            false,
            match.getId()
        );

        return ResponseEntity.ok(response);
    }

    // Get pending connection requests
    @GetMapping("/requests/pending")
    public ResponseEntity<List<ConnectionRequestResponse>> getPendingRequests(
            @AuthenticationPrincipal String email) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ConnectionRequestResponse> requests = matchService.getPendingRequests(currentUser.getId());

        return ResponseEntity.ok(requests);
    }

    // Accept connection request
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<LikeResponse> acceptRequest(
            @AuthenticationPrincipal String email,
            @PathVariable Long requestId) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = matchService.acceptConnectionRequest(requestId, currentUser.getId());

        LikeResponse response = new LikeResponse(
            "Connection accepted! 🎉",
            true,
            match.getId()
        );

        return ResponseEntity.ok(response);
    }

    // Decline connection request
    @DeleteMapping("/requests/{requestId}/decline")
    public ResponseEntity<Void> declineRequest(
            @AuthenticationPrincipal String email,
            @PathVariable Long requestId) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        matchService.declineConnectionRequest(requestId, currentUser.getId());

        return ResponseEntity.ok().build();
    }

    // Disconnect with a user
    @DeleteMapping("/disconnect/{userId}")
    public ResponseEntity<Void> disconnect(
            @AuthenticationPrincipal String email,
            @PathVariable Long userId) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        matchService.disconnect(currentUser.getId(), userId);

        return ResponseEntity.ok().build();
    }

    // Get all accepted matches
    @GetMapping
    public ResponseEntity<List<MatchedUserResponse>> getUserMatches(
            @AuthenticationPrincipal String email) {
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MatchedUserResponse> matches = matchService.getUserMatches(currentUser.getId());

        return ResponseEntity.ok(matches);
    }
}