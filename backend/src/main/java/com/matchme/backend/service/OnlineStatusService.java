package com.matchme.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineStatusService {
    // Thread-safe map: userId -> isOnline
    private final Map<Long, Boolean> onlineUsers = new ConcurrentHashMap<>();

    public void setOnline(Long userId) {
        onlineUsers.put(userId, true);
        System.out.println("User " + userId + " is now ONLINE");
    }

    public void setOffline(Long userId) {
        onlineUsers.put(userId, false);
        System.out.println("User " + userId + " is now OFFLINE");
    }

    public boolean isOnline(Long userId) {
        return onlineUsers.getOrDefault(userId, false);
    }
}