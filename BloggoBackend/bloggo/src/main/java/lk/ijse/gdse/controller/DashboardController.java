package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.Tag;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.DashboardService;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/all-users")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    public ResponseEntity<ApiResponseDTO> getAllUsers() {
        List<UserDTO> users = dashboardService.getAllUsers();
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "All users retrieved successfully",
                        users
                )
        );
    }

    @GetMapping("/all-posts")
    @PreAuthorize("hasAnyRole('USER','ADMIN', 'MEMBER')")
    public ResponseEntity<ApiResponseDTO> getAllPosts() {
        List<PostDTO> posts = dashboardService.getAllPosts();
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "All posts retrieved successfully",
                        posts
                )
        );
    }

    @GetMapping("/recent-published-posts")
    @PreAuthorize("hasAnyRole('USER','ADMIN','MEMBER')")
    public ResponseEntity<ApiResponseDTO> getRecentPublishedPosts() {
        List<PostDTO> posts = dashboardService.getRecentPublishedPosts();
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Top 10 recent published posts retrieved successfully",
                        posts
                )
        );
    }

    @GetMapping("/post/{postId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN', 'MEMBER')")
    public ResponseEntity<ApiResponseDTO> getPostById(@PathVariable Long postId) {
        PostDTO post = dashboardService.getPostById(postId);
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Post retrieved successfully",
                        post
                )
        );
    }

}
