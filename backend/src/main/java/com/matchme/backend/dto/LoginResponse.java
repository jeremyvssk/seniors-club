package com.matchme.backend.dto;

public class LoginResponse {
    private String message;
    private String token;
    private UserInfo user;
    
    public LoginResponse(String message, String token, UserInfo user) {
        this.message = message;
        this.token = token;
        this.user = user;
    }
    
    // Getters and Setters
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    // Nested class for user info
    public static class UserInfo {
        private Long id;
        private String email;
        private Boolean profileCompleted;

        
        public UserInfo(Long id, String email, Boolean profileCompleted) {
            this.id = id;
            this.email = email;
            this.profileCompleted = profileCompleted;
        }
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }

        public Boolean getProfileComplete() {
            return profileCompleted;
        }

        public void setProfileComplete(boolean profileCompleted) {
            this.profileCompleted = profileCompleted;
        }
    }
}