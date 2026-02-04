package com.matchme.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeRequest {

    @NotNull(message = "Liked user ID is required")
    private Long likedUserId;
    
}
