package com.matchme.backend.service;

import com.matchme.backend.model.UserProfile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchingAlgorithmService {
    
    // Haversine formula to calculate distance between two lat/long points in kilometers
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }

    // Calculate distance between two profiles (convenience method)
    public Double calculateDistanceBetweenProfiles(UserProfile profile1, UserProfile profile2) {        
        return calculateDistance(
            profile1.getLatitude(),
            profile1.getLongitude(),
            profile2.getLatitude(),
            profile2.getLongitude()
        );
    }
    
    // Check if target profile matches current user's gender preferences
    public boolean matchesGenderPreference(UserProfile currentUser, UserProfile targetUser) {
        // Check if target's and user's gender is in current looking-for list
        return currentUser.getLookingForGender().contains(targetUser.getGender()) &&
            targetUser.getLookingForGender().contains(currentUser.getGender());
    }
    
    // Check if target profile is within distance range
    public boolean isWithinDistance(UserProfile currentUser, UserProfile targetUser) {
        
        double distance = calculateDistance(
            currentUser.getLatitude(),
            currentUser.getLongitude(),
            targetUser.getLatitude(),
            targetUser.getLongitude()
        );
        
        // Must be within BOTH users' radius preferences
        return distance <= currentUser.getMaxRadiusKm() && 
               distance <= targetUser.getMaxRadiusKm();
    }

    // Quick pre-filter: check if target is within a bounding box
    // This avoids expensive Haversine calculations for obviously far-away users
    // A bounding box is a rectangle around the user - much faster to check than exact distance
    public boolean isWithinBoundingBox(UserProfile currentUser, UserProfile targetUser) {
        // Use the larger of the two radius preferences
        double maxRadius = Math.max(currentUser.getMaxRadiusKm(), targetUser.getMaxRadiusKm());
        // Rough approximation: 1 degree latitude ≈ 111 km
        double latDelta = maxRadius / 111.0;
        // Longitude varies by latitude (closer to poles = smaller distance per degree)
        // Use cosine of latitude to adjust
        double lonDelta = maxRadius / (111.0 * Math.cos(Math.toRadians(currentUser.getLatitude())));
        // Check if within bounding box
        double latDiff = Math.abs(currentUser.getLatitude() - targetUser.getLatitude());
        double lonDiff = Math.abs(currentUser.getLongitude() - targetUser.getLongitude());
        // If both differences are within the bounding box, return true
        return latDiff <= latDelta && lonDiff <= lonDelta;
    }
    
    // Calculate age gap score - IMPROVED with more granular scoring
    // Returns -300 if age gap is too large (>30 years), otherwise returns points
    public int calculateAgeScore(UserProfile currentUser, UserProfile targetUser) {       
        int ageGap = Math.abs(currentUser.getAge() - targetUser.getAge());
        
        if (ageGap > 30) {
            return -300; // too large age gap: filter out completely
        } else if (ageGap <= 5) {
            return 100; // Ideal: 0-5 years
        } else if (ageGap <= 10) {
            return 50; // Good: 6-10 years
        } else if (ageGap <= 15) {
            return 20; // Fair: 11-15 years
        } else {
            return 0; // Poor: 16-30 years (neutral, no boost)
        }
    }
    
    // Calculate hobby match score
    public int calculateHobbyScore(UserProfile currentUser, UserProfile targetUser) {
        long matchingHobbies = currentUser.getHobbies().stream()
            .filter(hobby -> targetUser.getHobbies().contains(hobby))
            .count();
        
        if (matchingHobbies >= 3) {
            return 150; // Ultimate boost: 3+ matching hobbies
        } else if (matchingHobbies == 2) {
            return 100; // Better boost: 2 matching hobbies
        } else if (matchingHobbies == 1) {
            return 50; // Good boost: 1 matching hobby
        } else {
            return 0; // No matching hobbies
        }
    }
    
    public int calculateLookingForScore(UserProfile currentUser, UserProfile targetUser) {        
        // High score if both looking for the same thing
        if (currentUser.getLookingFor().equals(targetUser.getLookingFor())) {
            return 150; // Same as 3+ hobby matches
        }
        // if looking for doesn't match don't give boost to this match
        return 0;
    }
    
    // Calculate total compatibility score
    public int calculateTotalScore(UserProfile currentUser, UserProfile targetUser) {
        int ageScore = calculateAgeScore(currentUser, targetUser);
        
        // Filter out if age gap too large
        if (ageScore < 0) {
            return ageScore; // Return the negative score to filter later
        }
        
        int hobbyScore = calculateHobbyScore(currentUser, targetUser);
        int lookingForScore = calculateLookingForScore(currentUser, targetUser);
        
        return ageScore + hobbyScore + lookingForScore;
    }
    
    // OPTIMIZED: Main filtering and scoring method with early filtering
    // This implements a "funnel" approach: strictest filters first to reduce candidates early
    public List<UserProfile> filterAndScoreProfiles(
        UserProfile currentUser,
        List<UserProfile> candidates
    ) {
        return candidates.stream()
            // STEP 1: Apply cheapest filter first (gender - just list comparison)
            .filter(candidate -> matchesGenderPreference(currentUser, candidate))

            // STEP 2: Bounding box filter (cheap, eliminates ~70-90% of remaining candidates)
            .filter(candidate -> isWithinBoundingBox(currentUser, candidate))
            
            // STEP 3: Apply expensive filter second (distance - requires calculation)
            // Only runs on candidates that passed gender and bounding box filters
            .filter(candidate -> isWithinDistance(currentUser, candidate))

            // STEP 4: Calculate score AND distance, wrap in ScoredProfile
            .map(candidate -> {
                int score = calculateTotalScore(currentUser, candidate);
                double distance = calculateDistance(
                    currentUser.getLatitude(),
                    currentUser.getLongitude(),
                    candidate.getLatitude(),
                    candidate.getLongitude()
                );
                candidate.setDistanceKm(distance);  // Store it
                return new ScoredProfile(candidate, score);
            })
                        
            // STEP 5: Filter out negative scores (age incompatible, score <= 0)
            .filter(scored -> scored.score > 0)
            
            // STEP 6: Sort by score (highest first)
            .sorted((a, b) -> Integer.compare(b.score, a.score))
            
            // STEP 7: Extract profiles
            .map(scored -> scored.profile)
            .collect(Collectors.toList());
    }
    
    // Helper class to hold profile + score during sorting
    private static class ScoredProfile {
        UserProfile profile;
        int score;
        
        ScoredProfile(UserProfile profile, int score) {
            this.profile = profile;
            this.score = score;
        }
    }
}