package com.matchme.backend.service;


import com.matchme.backend.model.Match;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserInteraction;
import com.matchme.backend.model.UserInteraction.InteractionType;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.MatchRepository;
import com.matchme.backend.repo.UserInteractionRepository;
import com.matchme.backend.repo.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class RecommendationService {
    private final UserProfileRepository profileRepository;
    private final UserInteractionRepository interactionRepository;
    private final MatchingAlgorithmService matchingAlgorithmService;
    private final MatchRepository matchRepository;

    public RecommendationService(UserProfileRepository profileRepository, UserInteractionRepository interactionRepository, MatchingAlgorithmService matchingAlgorithmService, MatchRepository matchRepository){
        this.profileRepository = profileRepository;
        this.interactionRepository = interactionRepository;
        this.matchingAlgorithmService = matchingAlgorithmService;
        this.matchRepository = matchRepository;
    }

    //Get recommendedprofiles
    public List<UserProfile> getRecommendations(User currentUser) {
        // Check if current user has completed their profile
        UserProfile myProfile = profileRepository.findByUserId(currentUser.getId())
            .orElse(null);
        
        if (myProfile == null || !myProfile.getProfileCompleted()) {
            // Return empty list if profile not completed
            return new ArrayList<>();
        }

        // Get profiles that were already liked or skipped
        List<UserInteraction> myInteractions = interactionRepository.findByUser(currentUser);
        List<Long> interactedUserIds = myInteractions.stream()
            .map(interaction -> interaction.getTargetProfile().getUser().getId())
            .collect(Collectors.toList());

        // Get all matches where current user is involved (both directions)
        List<Match> allMyMatches = matchRepository.findAll().stream()
            .filter(m -> m.getStatus() == Match.MatchStatus.MATCHED)
            .filter(m -> m.getUserId().equals(currentUser.getId()) || 
                        m.getLikedUserId().equals(currentUser.getId()))
            .collect(Collectors.toList());
        // Extract matched user IDs (the other person in each match)
        List<Long> matchedUserIds = allMyMatches.stream()
            .map(m -> m.getUserId().equals(currentUser.getId()) 
                ? m.getLikedUserId() 
                : m.getUserId())
            .collect(Collectors.toList());
        // Combine interacted and matched users into exclusion list
        List<Long> excludedUserIds = new ArrayList<>();
        excludedUserIds.addAll(interactedUserIds);
        excludedUserIds.addAll(matchedUserIds);
        // Remove duplicates from exclusion list
        excludedUserIds = excludedUserIds.stream().distinct().collect(Collectors.toList());

        // Get candidate profiles (excluding current user, interacted users, and matched users)
        List<UserProfile> candidateProfiles;
        if (excludedUserIds.isEmpty()) {
            // No exclusions, get all completed profiles except current user
            candidateProfiles = profileRepository.findAll().stream()
                .filter(profile -> profile.getProfileCompleted())
                .filter(profile -> !profile.getUser().getId().equals(currentUser.getId()))
                .collect(Collectors.toList());
        } else {
            // Use database query to efficiently filter excluded users
            candidateProfiles = profileRepository.findCandidateProfiles(
                currentUser.getId(),
                excludedUserIds
            );
        }

        // Apply matching algorithm (gender → distance → scoring)
        // The algorithm internally applies filters in optimal order (cheapest first)
        List<UserProfile> scoredProfiles = matchingAlgorithmService.filterAndScoreProfiles(
            myProfile,
            candidateProfiles
        );

        // Return top 10 matches, people with a photo first (stable sort keeps the score order within each group)
        return scoredProfiles.stream()
            .sorted(Comparator.comparing((UserProfile p) -> p.getProfilePictureUrl() == null || p.getProfilePictureUrl().isBlank()))
            .limit(10)
            .collect(Collectors.toList());
    }

    // Record the like action - now receives USER ID, not profile ID
    public void likeProfile(User currentUser, Long targetUserId) {
            UserProfile targetProfile = profileRepository.findByUserId(targetUserId)
            .orElseThrow(() -> new RuntimeException("Profile not found for user: " + targetUserId));
            
            UserInteraction interaction = new UserInteraction(currentUser, targetProfile, InteractionType.LIKE);
            interactionRepository.save(interaction);
    }

    // Record skip action - now receives USER ID, not profile ID
    public void skipProfile(User currentUser, Long targetUserId) {
            UserProfile targetProfile = profileRepository.findByUserId(targetUserId)
            .orElseThrow(() -> new RuntimeException("Profile not found for user: " + targetUserId));
            
            UserInteraction interaction = new UserInteraction(currentUser, targetProfile, InteractionType.SKIP);
            interactionRepository.save(interaction);
    }

    
}