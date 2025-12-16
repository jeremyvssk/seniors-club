package com.matchme.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {
    //where will the files be uploaded
    private final Path uploadDir = Paths.get("uploads").toAbsolutePath();

    public FileStorageService() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Can't create upload dir", e);
        }
    }
    //takes the file from frontend and user ID
    public String saveFile(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) return null;
    //generates unique file name
        try {
            String filename = "user-" + userId + "-" + UUID.randomUUID() + ".jpg";
    //actually saves the file
            Files.copy(file.getInputStream(), uploadDir.resolve(filename), 
                       StandardCopyOption.REPLACE_EXISTING);
    //returns the file name to be stored in database
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    //extracts url and deletes it
    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;
        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Files.deleteIfExists(uploadDir.resolve(filename));
        } catch (IOException e) {
            System.err.println("Failed to delete: " + fileUrl);
        }
    }
}