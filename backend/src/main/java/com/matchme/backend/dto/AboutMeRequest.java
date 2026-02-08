package com.matchme.backend.dto;

import jakarta.validation.constraints.Size;

public class AboutMeRequest {
    @Size(max = 150, message = "Bio must be no more than 150 characters")
    private String bio;
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}