package com.matchme.backend.dto;

import java.util.List;
import jakarta.validation.constraints.*;

public class ProfileRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Age is required")
    @Min(value = 18, message = "You must be at least 18 years old")
    @Max(value = 120, message = "Please enter a valid age")
    private Integer age;
    
    @NotBlank(message = "Gender is required")
    @Pattern(
        regexp = "^(man|woman|other)$",
        message = "Gender must be: man, woman, or other"
    )
    private String gender;
    
    @NotNull(message = "Hobbies are required")
    @NotEmpty(message = "At least one hobby is required")
    private List<String> hobbies;
    
    @NotBlank(message = "Please select what you are looking for")
    @Pattern(
        regexp = "^(love|friend|travel|open)$",
        message = "Invalid lookingFor value. Must be: love, friend, travel, or open"
    )
    private String lookingFor;

    @NotNull(message = "Please select who you are looking for")
    @NotEmpty(message = "At least one gender preference is required")
    @Size(min = 1, max = 3, message = "Select between 1 and 3 gender preferences")
    private List<@Pattern(regexp = "^(man|woman|other)$", message = "Each gender must be: man, woman, or other") String> lookingForGender;

    //optional - about me
    @Size(max = 150, message = "Bio must be no more than 150 characters")
    private String bio;

    // Optional - can be null
    private String profilePictureUrl;
    // loication stuff
    @NotNull(message = "Latitude is required")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    private Double longitude;
    
    @NotNull(message = "Maximum radius is required")
    @Min(value = 1, message = "Radius must be at least 1km")
    @Max(value = 300, message = "Radius cannot exceed 300km")
    private Integer maxRadiusKm;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public List<String> getHobbies() { return hobbies; }
    public void setHobbies(List<String> hobbies) { this.hobbies = hobbies; }

    public String getLookingFor() { return lookingFor; }
    public void setLookingFor(String lookingFor) { this.lookingFor = lookingFor; }

    public List<String> getLookingForGender() { return lookingForGender; }
    public void setLookingForGender(List<String> lookingForGender) { this.lookingForGender = lookingForGender; }


    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }


    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { 
        this.profilePictureUrl = profilePictureUrl; 
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public Integer getMaxRadiusKm() { return maxRadiusKm; }
    public void setMaxRadiusKm(Integer maxRadiusKm) { this.maxRadiusKm = maxRadiusKm; }
}