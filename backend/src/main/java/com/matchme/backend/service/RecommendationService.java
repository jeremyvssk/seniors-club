package com.matchme.backend.service;


import com.matchme.backend.model.User;
import com.matchme.backend.model.UserInteraction;
import com.matchme.backend.model.UserInteraction.InteractionType;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.UserInteractionRepository;
import com.matchme.backend.repo.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class RecommendationService {
    private final UserProfileRepository profileRepository;
    private final UserInteractionRepository interactionRepository;

    public RecommendationService(UserProfileRepository profileRepository, UserInteractionRepository interactionRepository){
        this.profileRepository = profileRepository;
        this.interactionRepository = interactionRepository;
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
        //get profiles that were already liked or skipped
        List<UserInteraction> myInteractions = interactionRepository.findByUser(currentUser);
                List<Long> interactedUserIds = myInteractions.stream()
                .map(interaction -> interaction.getTargetProfile().getUser().getId()) // get USER ID
                .collect(Collectors.toList());


        //find profiles that match preferences
        List<UserProfile> allProfiles = profileRepository.findAll();

        return allProfiles.stream()
        .filter(profile -> !profile.getUser().getId().equals(currentUser.getId())) //excludes urself
        .filter(profile -> profile.getProfileCompleted()) // Only show completed profiles
        .filter(profile -> !interactedUserIds.contains(profile.getUser().getId()))  // Filter already swiped by USER ID
                .limit(10) // Limit to 10 profiles at a time
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

                //here should add whether gender preferences match, 

                //here should add whether users liked eachother

                //here should add whether its a match or not

                //save the match to database 

                //notification to both users

                //enable chat


        
        }
