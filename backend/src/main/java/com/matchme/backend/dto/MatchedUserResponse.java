package com.matchme.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchedUserResponse {

    private Long userId;
    private String name;
    private Integer age;
    private String profilePictureUrl;
    private String bio;
    private LocalDateTime matchedAt;
    
}
