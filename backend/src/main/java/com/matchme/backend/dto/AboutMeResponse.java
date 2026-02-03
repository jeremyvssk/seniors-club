package com.matchme.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class AboutMeResponse {
    private Long id;
    private String bio;
    private Integer age;
    private String name;
    private List<String> hobbies;
    private String lookingFor;
    private String profilePictureUrl;
    private Integer maxRadiusKm;
    private String email;
     public AboutMeResponse() {
        this.hobbies = new ArrayList<>();
    }

    // Getters and setters
    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return this.name; }
    public void setName(String name) { this.name = name;}

    public String getEmail() { return email;}
    public void setEmail(String email) { this.email = email;}

    public List<String> getHobbies() { return this.hobbies; }
    public void setHobbies(List<String> hobbies) { this.hobbies = hobbies;}

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getLookingFor() { return this.lookingFor; }
    public void setLookingFor(String lookingFor) { this.lookingFor = lookingFor;} 

    public String getProfilePictureUrl() { return this.profilePictureUrl; }
    public void setProfilePictureUrl(String url) { this.profilePictureUrl = url;}

    public Integer getMaxRadiusKm() { return maxRadiusKm; }
    public void setMaxRadiusKm(Integer maxRadiusKm) { this.maxRadiusKm = maxRadiusKm; }
}
