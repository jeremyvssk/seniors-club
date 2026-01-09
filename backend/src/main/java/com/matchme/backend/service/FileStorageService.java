package com.matchme.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {
    
    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadPath) {
        // This will be relative to wherever the app runs from
        // In dev: /home/jeremyvssk/matchme/web/backend/uploads
        // On someone else's machine: /their/path/backend/uploads
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Can't create upload dir", e);
        }
    }
    
    //takes the file from frontend and user ID
    public String saveFile(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) return null;
    //generates unique file name. example: "user-32-abc123.jpg"
        try {
            String filename = "user-" + userId + "-" + UUID.randomUUID() + ".jpg";
    //saves the file to uploads directory. example: web/backend/uploads/user-32-abc123.jpg
            Files.copy(file.getInputStream(), uploadDir.resolve(filename), 
                       StandardCopyOption.REPLACE_EXISTING);
    //returns the file name to be stored in database. example: "/uploads/user-32-abc123.jpg"
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