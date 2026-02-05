package com.matchme.backend.dto;

public class AboutMeResponse {
    private Long id;
    private String bio;
    
    // Getters and setters
    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}