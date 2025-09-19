package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.BroadcastDTO;
import lk.ijse.gdse.service.AdminDashboardService;
import lk.ijse.gdse.service.BroadcastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin-dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@Tag(name = "Admin-Dashboard", description = "Operations related to Admin")

public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final BroadcastService broadcastService;

    @GetMapping("/users/stats")
    @Operation(summary = "get user statistics")
    public Map<String, Object> getUserStats() {
        return dashboardService.getUserStats();
    }

    @GetMapping("/posts/stats")
    @Operation(summary = "get post statistics")
    public Map<String, Object> getPostStats() {
        return dashboardService.getPostStats();
    }

    @GetMapping("/boosts/stats")
    @Operation(summary = "get boost statistics")
    public Map<String, Object> getBoostStats() {
        return dashboardService.getBoostStats();
    }

    @GetMapping("/comments/stats")
    @Operation(summary = "get comment statistics")
    public Map<String, Object> getCommentStats() {
        return dashboardService.getCommentStats();
    }

    @PostMapping("/broadcast")
    @Operation(summary = "send broadcast message for every user expect admin")
    public ResponseEntity<String> sendBroadcast(@RequestBody BroadcastDTO dto) {
        try {
            broadcastService.sendBroadcast(dto);
            return ResponseEntity.ok("Broadcast sent and emailed to all users!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending broadcast: " + e.getMessage());
        }
    }
}
