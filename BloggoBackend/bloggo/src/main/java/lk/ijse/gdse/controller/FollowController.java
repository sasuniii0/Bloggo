package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.FollowService;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/follows")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class FollowController {
    private final FollowService followService;
    private final UserService userService;

    @PostMapping("/{followedId}")
    public ResponseEntity<ApiResponseDTO> followUser(@PathVariable Long followedId, Principal principal) {
        // Extract the logged-in user's username from Principal
        String username = principal.getName();

        // Fetch follower user by username
        User follower = userService.findByUsername(username);

        // Call service
        return ResponseEntity.ok(followService.followUser(followedId, follower.getUserId()));
    }


    @GetMapping("/{userId}/count")
    public ResponseEntity<ApiResponseDTO> getFollowerCount(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowerCount(userId));
    }
}
