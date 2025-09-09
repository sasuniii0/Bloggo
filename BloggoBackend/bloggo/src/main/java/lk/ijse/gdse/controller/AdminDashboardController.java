package lk.ijse.gdse.controller;

import lk.ijse.gdse.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin-dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")

public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

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
}
