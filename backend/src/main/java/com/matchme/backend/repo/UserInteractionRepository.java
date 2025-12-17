package com.matchme.backend.repo;

import com.matchme.backend.model.User;
import com.matchme.backend.model.UserInteraction;
import com.matchme.backend.model.UserInteraction.InteractionType;
import com.matchme.backend.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    
    //find all interactions done by specific user
    List<UserInteraction> findByUser(User user);
    //find all profiles user has liked
    List<UserInteraction> findByUserAndInteractionType(User user, InteractionType interactionType);
    //check if user has already interacted with this profile
    Optional<UserInteraction> findbyUserandTargetProfile(User user, UserProfile targetProfile);
    //check if this interction exists
    boolean existsByUserAndTargetProfileAndInteractionType(User user, UserProfile targetProfile, InteractionType interactionType);
    //find all users who liked this profile
    List<UserInteraction> findbyTargetProfileAndInteractionType(UserProfile targetProfile, InteractionType interactionType);




}
