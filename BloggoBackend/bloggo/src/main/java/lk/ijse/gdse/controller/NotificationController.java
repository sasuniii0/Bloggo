package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.NotificationDTO;
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
@Tag(name = "Notification", description = "Operations related to Notification")

public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    @Operation(summary = "get the notification of the user within userId")
    public ResponseEntity<ApiResponseDTO> getUserNotifications(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "User notifications fetched successfully",
                notifications
        ));
    }

    @PutMapping("/read/{id}")
    @Operation(summary = "update the notification  marked as read")
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

    @GetMapping("/unread/{userId}")
    @Operation(summary = "get all the unread notifications")
    public ResponseEntity<ApiResponseDTO> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationDTO> unread = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "Unread notifications fetched successfully",
                unread
        ));
    }

}
