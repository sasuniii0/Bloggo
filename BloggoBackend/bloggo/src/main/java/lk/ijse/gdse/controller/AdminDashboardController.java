package lk.ijse.gdse.controller;

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

public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final BroadcastService broadcastService;

    @GetMapping("/users/stats")
    public Map<String, Object> getUserStats() {
        return dashboardService.getUserStats();
    }

    @GetMapping("/posts/stats")
    public Map<String, Object> getPostStats() {
        return dashboardService.getPostStats();
    }

    @GetMapping("/boosts/stats")
    public Map<String, Object> getBoostStats() {
        return dashboardService.getBoostStats();
    }

    @GetMapping("/comments/stats")
    public Map<String, Object> getCommentStats() {
        return dashboardService.getCommentStats();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<String> sendBroadcast(@RequestBody BroadcastDTO dto) {
        try {
            broadcastService.sendBroadcast(dto);
            return ResponseEntity.ok("Broadcast sent and emailed to all users!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending broadcast: " + e.getMessage());
        }
    }
}
