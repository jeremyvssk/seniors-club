package com.matchme.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL) // Don't serialize null fields
public class AboutMeResponse {
    private Long id;
    private String bio;
    private Boolean isOnline;
    // Getters and setters
    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Boolean getIsOnline() {
        return isOnline;
    }
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
}