package com.matchme.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionRequestResponse {
    private Long requestId;
    private Long userId;
    private String name;
    private Integer age;
    private String profilePictureUrl;
    private String bio;
    private List<String> hobbies; 
    private String lookingFor; 
    private String gender; 
    private LocalDateTime requestedAt;
}