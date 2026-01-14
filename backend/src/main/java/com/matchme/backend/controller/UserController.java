package com.matchme.backend.controller;

import com.matchme.backend.dto.SignupRequest;
import com.matchme.backend.dto.SignupResponse;
import com.matchme.backend.dto.LoginRequest;
import com.matchme.backend.dto.LoginResponse;
import com.matchme.backend.model.User;
import com.matchme.backend.service.UserService;
import com.matchme.backend.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from Vite frontend
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    
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
        // error handling here atm, should do a seperate file for error handling later
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Authenticate user
            Optional<User> userOpt = userService.authenticateUser(
                request.getEmail(), 
                request.getPassword()
            );
            
            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid credentials");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            User user = userOpt.get();
            
            //check if user is created or not
            Boolean profileCompleted = userService.isProfileCompleted(user.getId());

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            
            // Create response
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(), 
                user.getEmail(),
                profileCompleted
            );
            
            LoginResponse response = new LoginResponse(
                "Login successful",
                token,
                userInfo
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}