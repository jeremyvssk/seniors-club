//Entry point to handle incoming HTTP requests about user profiles
//creating or updating
//calls profileservice to do the actual business logic and returns the 
//profileresponse to user.

package com.matchme.backend.controller;

import com.matchme.backend.dto.ProfileRequest;
import com.matchme.backend.dto.ProfileResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.service.ProfileService;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }
    
    @PostMapping("/profile")
   public ProfileResponse createOrUpdateProfile(
    @AuthenticationPrincipal String email,
    @Valid @RequestBody ProfileRequest request
   ) {
       System.out.println("Received profile request for email: " + email);
       System.out.println("Request data: " + request.getName() + ", " + request.getAge());
       
       User user = userService.findByEmail(email)
           .orElseThrow(() -> new RuntimeException("User not found"));
       
    return profileService.saveOrUpdateProfile(user, request, null, null);
   }

   @GetMapping("/profile")
    public ProfileResponse getMyProfile(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return profileService.getProfile(user);
    }
}


//post
//get
