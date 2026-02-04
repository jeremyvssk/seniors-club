package com.matchme.backend.service;

import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.UserProfileRepository;
import com.matchme.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MatchingAlgorithmService matchingAlgorithmService;

    public User createUser(String email, String password) {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // BCrypt hash
        
        // Save to database
        return userRepository.save(user);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public Optional<User> authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public Boolean isProfileCompleted(Long userId) {
        Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);
        if (profileOpt.isPresent()) {
            return profileOpt.get().getProfileCompleted();
        }
        return false;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Get user bio with distance calculated from viewer's perspective
    public UserProfile getUserBioWithDistance(Long targetUserId, User viewerUser) {
        UserProfile targetProfile = userProfileRepository.findByUserId(targetUserId)
            .orElse(null);
        
        if (targetProfile == null || !targetProfile.getProfileCompleted()) {
            return null;
        }

        // Don't calculate distance if viewing own profile
        if (viewerUser != null && !viewerUser.getId().equals(targetUserId)) {
            UserProfile viewerProfile = userProfileRepository.findByUserId(viewerUser.getId())
                .orElse(null);
            
            if (viewerProfile != null) {
                Double distance = matchingAlgorithmService.calculateDistanceBetweenProfiles(
                    viewerProfile, 
                    targetProfile
                );
                targetProfile.setDistanceKm(distance);
            }
        }

        return targetProfile;
    }
}