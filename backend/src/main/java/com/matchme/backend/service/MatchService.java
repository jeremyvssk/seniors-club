package com.matchme.backend.service;

import com.matchme.backend.dto.ConnectionRequestResponse;
import com.matchme.backend.dto.MatchedUserResponse;
import com.matchme.backend.model.Match;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.MatchRepository;
import com.matchme.backend.repo.UserProfileRepository;
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
    private UserProfileRepository userProfileRepository;

    // Send connection request (like a user)
    @Transactional
    public Match sendConnectionRequest(Long userId, Long likedUserId) {
        if (userId.equals(likedUserId)) {
            throw new IllegalArgumentException("You cannot send a connection request to yourself");
        }

        // Check if already sent a request
        Optional<Match> existingRequest = matchRepository.findByUserIdAndLikedUserId(userId, likedUserId);
        if (existingRequest.isPresent()) {
            Match existing = existingRequest.get();
            if (existing.getStatus() == Match.MatchStatus.PENDING) {
                return existing; // Already sent
            } else if (existing.getStatus() == Match.MatchStatus.DECLINED) {
                // Allow re-sending after decline
                existing.setStatus(Match.MatchStatus.PENDING);
                existing.setCreatedAt(LocalDateTime.now());
                return matchRepository.save(existing);
            }
        }

        // Create new connection request
        Match match = new Match();
        match.setUserId(userId);
        match.setLikedUserId(likedUserId);
        match.setStatus(Match.MatchStatus.PENDING);

        return matchRepository.save(match);
    }

    // Accept connection request
    @Transactional
    public Match acceptConnectionRequest(Long requestId, Long currentUserId) {
        Match request = matchRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        // Verify the request is for this user
        if (!request.getLikedUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("You cannot accept this request");
        }

        // Verify it's still pending
        if (request.getStatus() != Match.MatchStatus.PENDING) {
            throw new IllegalArgumentException("Request is no longer pending");
        }

        // Accept the request
        request.setStatus(Match.MatchStatus.MATCHED);
        request.setMatchedAt(LocalDateTime.now());
        matchRepository.save(request);

        // Create reverse match (so both users have the connection)
        Optional<Match> reverseMatch = matchRepository.findByUserIdAndLikedUserId(currentUserId, request.getUserId());
        if (reverseMatch.isEmpty()) {
            Match reverse = new Match();
            reverse.setUserId(currentUserId);
            reverse.setLikedUserId(request.getUserId());
            reverse.setStatus(Match.MatchStatus.MATCHED);
            reverse.setMatchedAt(LocalDateTime.now());
            matchRepository.save(reverse);
        } else {
            Match reverse = reverseMatch.get();
            reverse.setStatus(Match.MatchStatus.MATCHED);
            reverse.setMatchedAt(LocalDateTime.now());
            matchRepository.save(reverse);
        }

        return request;
    }

    // Decline connection request
    @Transactional
    public void declineConnectionRequest(Long requestId, Long currentUserId) {
        Match request = matchRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        // Verify the request is for this user
        if (!request.getLikedUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("You cannot decline this request");
        }

        // Delete the request
        matchRepository.delete(request);
    }

    // Get pending connection requests
    public List<ConnectionRequestResponse> getPendingRequests(Long userId) {
        List<Match> requests = matchRepository.findPendingRequestsForUser(userId);

        return requests.stream()
                .map(request -> {
                    Long requesterId = request.getUserId();
                    
                    UserProfile requesterProfile = userProfileRepository.findByUserId(requesterId)
                            .orElseThrow(() -> new RuntimeException("Profile not found"));
                    
                    return new ConnectionRequestResponse(
                        request.getId(),
                        requesterId,
                        requesterProfile.getName(),
                        requesterProfile.getAge(),
                        requesterProfile.getProfilePictureUrl(),
                        requesterProfile.getBio(),
                        requesterProfile.getHobbies(), 
                        requesterProfile.getLookingFor(), 
                        requesterProfile.getGender(),
                        request.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    // Disconnect (remove match)
    @Transactional
    public void disconnect(Long userId, Long otherUserId) {
        // Find and delete all matches between these users
        Optional<Match> match1 = matchRepository.findByUserIdAndLikedUserId(userId, otherUserId);
        Optional<Match> match2 = matchRepository.findByUserIdAndLikedUserId(otherUserId, userId);

        match1.ifPresent(matchRepository::delete);
        match2.ifPresent(matchRepository::delete);
    }

    // Check if users are matched
    public boolean areUsersMatched(Long user1Id, Long user2Id) {
        return matchRepository.areUsersMatched(user1Id, user2Id);
    }

    // Get all accepted matches
    public List<MatchedUserResponse> getUserMatches(Long userId) {
        List<Match> matches = matchRepository.findAllMatchesByUserId(userId);

        return matches.stream()
                .map(match -> {
                    Long matchedUserId = match.getUserId().equals(userId) 
                        ? match.getLikedUserId() 
                        : match.getUserId();
                    
                    UserProfile matchedProfile = userProfileRepository.findByUserId(matchedUserId)
                            .orElseThrow(() -> new RuntimeException("Profile not found"));
                    
                    return new MatchedUserResponse(
                        matchedUserId,
                        matchedProfile.getName(),
                        matchedProfile.getAge(),
                        matchedProfile.getProfilePictureUrl(),
                        matchedProfile.getBio(),
                        matchedProfile.getHobbies(),
                        matchedProfile.getLookingFor(),
                        matchedProfile.getGender(),
                        match.getMatchedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    //gett all accepted matches by their id (/connections endpoint)
    public List<Long> getConnectionIds(Long userId) {
    List<Match> matches = matchRepository.findAllMatchesByUserId(userId);

    return matches.stream()
            .filter(m -> m.getStatus() == Match.MatchStatus.MATCHED)
            .map(m -> m.getUserId().equals(userId)
                    ? m.getLikedUserId()
                    : m.getUserId())
            .distinct()
            .collect(Collectors.toList());
}

    // Check if user has sent a request
    public boolean hasUserLiked(Long userId, Long likedUserId) {
        Optional<Match> match = matchRepository.findByUserIdAndLikedUserId(userId, likedUserId);
        return match.isPresent() && match.get().getStatus() == Match.MatchStatus.PENDING;
    }
}