package com.matchme.backend.dto;

import java.util.List;

public class UserBioResponse {
    private Long id;
    private String gender;
    private Integer age;
    private List<String> hobbies;
    private String lookingFor;
    private List<String> lookingForGender;
    private Double distanceKm;
    private Integer maxRadiusKm;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

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

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getMaxRadiusKm() {
        return maxRadiusKm;
    }

    public void setMaxRadiusKm(Integer maxRadiusKm) {
        this.maxRadiusKm = maxRadiusKm;
    }
}