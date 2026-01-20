package com.matchme.backend.dto;

public class AboutMeResponse {
    private Long id;
    private String bio;
    private Integer age;
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}