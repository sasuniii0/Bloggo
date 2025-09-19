package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.Post;
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
@Tag(name = "User-Dashboard", description = "Operations related to Dashboard")

public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("search/{keyword}")
    @Operation(summary = "search blog-posts by keyword")
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
    @Operation(summary = "get All users")
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
    @Operation(summary = "get All posts")
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
    @Operation(summary = "get blog-posts by published date")
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
    @Operation(summary = "get post by postId")
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
