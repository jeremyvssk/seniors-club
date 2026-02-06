package com.matchme.backend.dto;

import java.util.List;
import jakarta.validation.constraints.*;

public class UserBioRequest {


    @Size(min = 1, message = "Please select at least 1 hobbies")
    private List<String> hobbies;

    @Pattern(regexp = "^(love|friend|travel|open)$", message = "Invalid lookingFor value")
    private String lookingFor;

    @Size(min = 1, max = 3, message = "Select between 1 and 3 gender preferences")
    private List<@Pattern(regexp = "^(man|woman|other)$") String> lookingForGender;

    @Min(value = 1, message = "Radius must be at least 1km")
    @Max(value = 300, message = "Radius cannot exceed 300km")
    private Integer maxRadiusKm;

    // Getters and Setters


    public List<String> getHobbies() {
        return hobbies;
    }

    public void setHobbies(List<String> hobbies) {
        this.hobbies = hobbies;
    }

    public String getLookingFor() {
        return lookingFor;
    }

    public void setLookingFor(String lookingFor) {
        this.lookingFor = lookingFor;
    }

    public List<String> getLookingForGender() {
        return lookingForGender;
    }

    public void setLookingForGender(List<String> lookingForGender) {
        this.lookingForGender = lookingForGender;
    }

    public Integer getMaxRadiusKm() {
        return maxRadiusKm;
    }

    public void setMaxRadiusKm(Integer maxRadiusKm) {
        this.maxRadiusKm = maxRadiusKm;
    }
}