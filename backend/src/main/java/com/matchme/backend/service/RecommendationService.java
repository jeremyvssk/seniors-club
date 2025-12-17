package com.matchme.backend.service;


import com.matchme.backend.model.User;
import com.matchme.backend.model.UserInteraction;
import com.matchme.backend.model.UserInteraction.InteractionType;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.UserInteractionRepository;
import com.matchme.backend.repo.UserProfileRepository;
import org.springframework.stereotype.Service;


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


    //get profiles that were already liked or skipped
    List<UserInteraction> myInteractions = interactionRepository.findByUser(currentUser);
        List<Long> interactedProfileIds = myInteractions.stream()
            .map(interaction -> interaction.getTargetProfile().getId())
            .collect(Collectors.toList());


    //find profiles that match preferences
    List<UserProfile> allProfiles = profileRepository.findAll();

    return allProfiles.stream()
    .filter(profile -> !profile.getUser().getId().equals(currentUser.getId())) //excludes urself
    .filter(profile -> !interactedProfileIds.contains(profile.getId())) // Exclude already swiped
            .limit(10) // Limit to 10 profiles at a time
            .collect(Collectors.toList());
    }

    //REcord the likes action
    public void likeProfile(User currentUser, Long targetProfileId) {
            UserProfile targetProfile = profileRepository.findById(targetProfileId)
            .orElseThrow(() -> new RuntimeException("Profile not founds"));
    //save likes
            UserInteraction interaction = new UserInteraction(currentUser, targetProfile, InteractionType.LIKE);
            interactionRepository.save(interaction);

    }

    //Records skip action

            public void skipProfile(User currentUser, Long targetProfileId) {
                UserProfile targetProfile = profileRepository.findById(targetProfileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
            

    //save skips
            UserInteraction interaction = new UserInteraction(currentUser, targetProfile, InteractionType.SKIP);
            interactionRepository.save(interaction);

        }

        //here should add whether gender preferences match, 

        //here should add whether users liked eachother

        //here should add whether its a match or not

        //save the match to database 


    
}
