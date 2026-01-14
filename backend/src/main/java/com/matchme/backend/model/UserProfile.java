//Model to represent user profile in the database
package com.matchme.backend.model;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    private String name;
    private Integer age;
    // Store as string but validate with enum
    @Column(nullable = false)
    private String gender;

    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    @Column(name = "max_radius_km")
    private Integer maxRadiusKm;

    @ElementCollection
    @CollectionTable(name = "user_hobbies", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "hobby")
    private List<String> hobbies;

    // Explicitly set fetch type and initialize
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_looking_for_gender", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "gender")
    private List<String> lookingForGender = new ArrayList<>();

    private String bio;
    private String lookingFor;
    private String profilePictureUrl;
    private boolean profileCompleted = false;
    // getters/setters
    public Long getId() {return id;}

    public User getUser() {return user;}
    public void setUser(User user) {this.user = user;}

    public String getName() {return name;}
    public void setName(String name) {this.name = name;}

    public Integer getAge() {return age;}
    public void setAge(Integer age) {this.age = age;}

    public String getGender() {return gender;}
    public void setGender(String gender) {this.gender = gender;}

    public List<String> getHobbies() {return hobbies;}
    public void setHobbies(List<String> hobbies) {this.hobbies = hobbies;}

    public String getLookingFor() {return lookingFor;}
    public void setLookingFor(String lookingFor) {this.lookingFor = lookingFor;}  

    public List<String> getLookingForGender() {return lookingForGender;}
    public void setLookingForGender(List<String> lookingForGender) {this.lookingForGender = lookingForGender;}

    public String getBio() {return bio;}
    public void setBio(String bio) {this.bio = bio;}  

    public String getProfilePictureUrl() {return profilePictureUrl;}
    public void setProfilePictureUrl(String profilePictureUrl) {this.profilePictureUrl = profilePictureUrl;}

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public Integer getMaxRadiusKm() { return maxRadiusKm; }
    public void setMaxRadiusKm(Integer maxRadiusKm) { this.maxRadiusKm = maxRadiusKm; }

    public boolean getProfileCompleted() {return profileCompleted;}
    public void setProfileCompleted(boolean profileCompleted) {this.profileCompleted = profileCompleted;}
}

