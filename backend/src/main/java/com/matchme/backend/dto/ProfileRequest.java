//Accepts user input

package com.matchme.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProfileRequest {
    private String name;
    private Integer age;
    private String gender;
    private String location;
    private List<String> hobbies;
    private String lookingFor;

    @NotBlank(message = "Name is required")
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @NotNull(message = "Must choose age")
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    @NotBlank(message = "Gender is required for maximum experience")
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    @NotBlank(message = "Location is required to continue")
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }


    @Size(min = 5, message = "Must choose atleast 5 hobbies")    
    public List<String> getHobbies() { return hobbies; }
    public void setHobbies(List<String> hobbies) { this.hobbies = hobbies; }


    @NotBlank(message = "Must choose atleast 1")
    public String getLookingFor() { return lookingFor; }
    public void setLookingFor(String lookingFor) { this.lookingFor = lookingFor; }
}
