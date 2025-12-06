//info thats being sent back to the user

package com.matchme.backend.dto;

import java.util.List;

public class ProfileResponse {
    public Long id;
    public String name;
    public Integer age;
    public String gender;
    public String location;
    public List<String> hobbies;
    public String lookingFor;
    public String profilePictureUrl;
    public boolean profileCompleted;
}
