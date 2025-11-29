package com.matchme.backend.controller;

import com.matchme.backend.dto.SignupRequest;
import com.matchme.backend.dto.SignupResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from Vite frontend
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            // Create user in database
            User user = userService.createUser(request.getEmail(), request.getPassword());
            
            // Return success response
            SignupResponse response = new SignupResponse(
                "Congratulations! User created.",
                user.getId()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            // Email already exists
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            
        } catch (Exception e) {
            // Other errors
            Map<String, String> error = new HashMap<>();
            error.put("message", "Sign up failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}