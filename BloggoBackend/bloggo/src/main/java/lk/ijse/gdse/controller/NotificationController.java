package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.Type;
import lk.ijse.gdse.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/notification")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponseDTO> createNotification(
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam Type type) {
        Notification notification = notificationService.createNotification(userId, message, type);
        return ResponseEntity.ok(
                ApiResponseDTO.builder()
                        .status(200)
                        .message("Notification created successfully")
                        .data(notification)
                        .build()
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponseDTO> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(
                ApiResponseDTO.builder()
                        .status(200)
                        .message("Notifications fetched successfully")
                        .data(notifications)
                        .build()
        );
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<ApiResponseDTO> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(
                ApiResponseDTO.builder()
                        .status(200)
                        .message("Notification marked as read")
                        .data(null)
                        .build()
        );
    }
}
