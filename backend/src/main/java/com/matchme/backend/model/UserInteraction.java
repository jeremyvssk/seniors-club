package com.matchme.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.LocalDateTime;



@Entity
@Table(name = "userinteraction")


public class UserInteraction {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

//who is performing the action
@ManyToOne
@JoinColumn(name = "user_id", nullable = false)
private User user; 

//who is the target profile that was liked or skped
@ManyToOne
@JoinColumn(name = "target_profile_id", nullable = false)
private UserProfile targetProfile; 

//what action was taken, like or skip
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private InteractionType interactionType; 

//when was the action taken
@Column(nullable = false)
private LocalDateTime createdAt;

public UserInteraction() {
    this.createdAt= LocalDateTime.now();
}

public UserInteraction(User user, UserProfile targetProfile, InteractionType interactionType) {
    this.user = user;
    this.targetProfile = targetProfile;
    this.interactionType = interactionType;
    this.createdAt = LocalDateTime.now();
}

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public User getUser() {
    return user;
}
public void setUser(User user) {
    this.user = user;
}

public UserProfile getTargetProfile() {
    return targetProfile;
}

public void setTargetProfile (UserProfile targetProfile) {
    this.targetProfile = targetProfile;
}

public InteractionType getInteractionType() {
    return interactionType;
}

public void setInteractionType (InteractionType interactionType) {
this.interactionType = interactionType;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public void setCreatedAt (LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

//Enum for interactiontypes

public enum InteractionType {
    LIKE,
    SKIP
}

}


//target profile ID
//action type like or skip
//time stamp