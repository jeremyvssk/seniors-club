package com.matchme.backend.service;

import com.matchme.backend.dto.MatchedUserResponse;
import com.matchme.backend.model.Match;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.MatchRepository;
import com.matchme.backend.repo.UserProfileRepository;
import com.matchme.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    // Like a user
    @Transactional
    public Match likeUser(Long userId, Long likedUserId) {
        // Can't like yourself
        if (userId.equals(likedUserId)) {
            throw new IllegalArgumentException("You cannot like yourself");
        }

        // Check if already liked
        Optional<Match> existingLike = matchRepository.findByUserIdAndLikedUserId(userId, likedUserId);
        if (existingLike.isPresent()) {
            return existingLike.get(); // Already liked
        }

        // Check if the other user already liked this user (mutual match)
        Optional<Match> reverseLike = matchRepository.findByUserIdAndLikedUserId(likedUserId, userId);
        
        // Create the like
        Match match = new Match();
        match.setUserId(userId);
        match.setLikedUserId(likedUserId);
        
        if (reverseLike.isPresent()) {
            // It's a mutual match!
            match.setIsMatch(true);
            match.setMatchedAt(LocalDateTime.now());
            
            // Update the reverse like to also be a match
            Match reverseMatch = reverseLike.get();
            reverseMatch.setIsMatch(true);
            reverseMatch.setMatchedAt(LocalDateTime.now());
            matchRepository.save(reverseMatch);
        } else {
            match.setIsMatch(false);
        }

        return matchRepository.save(match);
    }

    // Unlike a user
    @Transactional
    public void unlikeUser(Long userId, Long likedUserId) {
        Optional<Match> match = matchRepository.findByUserIdAndLikedUserId(userId, likedUserId);
        
        if (match.isPresent()) {
            Match m = match.get();
            
            // If it was a mutual match, update the other user's match status
            if (m.getIsMatch()) {
                Optional<Match> reverseMatch = matchRepository.findByUserIdAndLikedUserId(likedUserId, userId);
                if (reverseMatch.isPresent()) {
                    Match rm = reverseMatch.get();
                    rm.setIsMatch(false);
                    rm.setMatchedAt(null);
                    matchRepository.save(rm);
                }
            }
            
            // Delete the like
            matchRepository.delete(m);
        }
    }

    // Check if user has liked another user
    public boolean hasUserLiked(Long userId, Long likedUserId) {
        return matchRepository.findByUserIdAndLikedUserId(userId, likedUserId).isPresent();
    }

    // Check if users are matched
    public boolean areUsersMatched(Long user1Id, Long user2Id) {
        return matchRepository.existsByUser1IdAndUser2IdAndIsMatch(user1Id, user2Id, true);
    }

    // Get all matches for a user
    public List<MatchedUserResponse> getUserMatches(Long userId) {
        List<Match> matches = matchRepository.findAllMatchesByUserId(userId);
        
        return matches.stream()
                .map(match -> {
                    Long matchedUserId = match.getLikedUserId();
                    
                    User matchedUser = userRepository.findById(matchedUserId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    UserProfile matchedProfile = userProfileRepository.findByUserId(matchedUserId)
                            .orElseThrow(() -> new RuntimeException("Profile not found"));
                    
                    return new MatchedUserResponse(
                        matchedUserId,
                        matchedProfile.getName(),
                        matchedProfile.getAge(),
                        matchedProfile.getProfilePictureUrl(),
                        matchedProfile.getBio(),
                        match.getMatchedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    // Get pending likes (users who liked the current user but not matched yet)
    public List<Long> getPendingLikes(Long userId) {
        return matchRepository.findPendingLikesForUser(userId)
                .stream()
                .map(Match::getUserId)
                .collect(Collectors.toList());
    }
}