package com.matchme.backend.dto;

import jakarta.validation.constraints.*;

public class ProfileUpdateRequest {



    @Size(max = 150, message = "Bio cannot exceed 150 characters")
    private String bio;

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
