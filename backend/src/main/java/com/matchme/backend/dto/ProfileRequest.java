package com.matchme.backend.dto;

import java.util.List;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public class ProfileRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Age is required")
    @Min(value = 18, message = "You must be at least 18 years old")
    @Max(value = 120, message = "Please enter a valid age")
    private Integer age;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotNull(message = "Hobbies are required")
    @NotEmpty(message = "At least one hobby is required")
    private List<String> hobbies;
    
    @NotBlank(message = "Please select what you are looking for")
    @Pattern(
        regexp = "^(love|friend|travel|open)$",
        message = "Invalid lookingFor value. Must be: love, friend, travel, or open"
    )
    private String lookingFor;
    
    // Optional - can be null
    private String profilePictureUrl;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getHobbies() { return hobbies; }
    public void setHobbies(List<String> hobbies) { this.hobbies = hobbies; }

    public String getLookingFor() { return lookingFor; }
    public void setLookingFor(String lookingFor) { this.lookingFor = lookingFor; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { 
        this.profilePictureUrl = profilePictureUrl; 
    }
}