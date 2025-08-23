package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.Tag;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",allowCredentials = "true")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("search/{keyword}")
    public ResponseEntity<ApiResponseDTO> searchByKeyword(@PathVariable String keyword) {
        List<Post>  posts= dashboardService.serachByKeyword(keyword);
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Search results retrieved successfully",
                        posts
                )
        );
    }
}
