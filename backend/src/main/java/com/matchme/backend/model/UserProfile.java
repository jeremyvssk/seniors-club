//Model to represent user profile in the database
//

package com.matchme.backend.model;

import java.util.List;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

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
    private String gender;
    private String location;



    @ElementCollection
    @CollectionTable(name = "user_hobbies", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "hobby")
    private List<String> hobbies;

    private String lookingFor;

    private String profilePictureUrl;

    private boolean profileCompleted = false;

    public Long getId() {return id;}
    public void setId(Long id) {this.id=id;}

    public User getUser() {return user;}
    public void setUser(User user) {this.user = user;}

    public String getName() {return name;}
    public void setName(String name) {this.name = name;}

    public Integer getAge() {return age;}
    public void setAge(Integer age) {this.age = age;}

    public String getGender() {return gender;}
    public void setGender(String gender) {this.gender = gender;}

    public String getLocation() {return location;}
    public void setLocation(String location) {this.location = location;}

    public List<String> getHobbies() {return hobbies;}
    public void setHobbies(List<String> hobbies) {this.hobbies = hobbies;}

    public String getLookingFor() {return lookingFor;}
    public void setLookingFor(String lookingFor) {this.lookingFor = lookingFor;}

    public String getProfilePictureUrl() {return profilePictureUrl;}
    public void setProfilePictureUrl(String profilePictureUrl) {this.profilePictureUrl = profilePictureUrl;}

    public boolean isProfileCompleted() {return profileCompleted;}
    public void setProfileCompleted(boolean profileCompleted) {this.profileCompleted = profileCompleted;}

}


//ID
// name
// age
// gender
// location
// hobbies
// lookingfor
// profilepic