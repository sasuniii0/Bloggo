package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.FollowDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.Follow;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.FollowService;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/follows")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@Tag(name = "Follow", description = "Operations related to Following")

public class FollowController {
    private final FollowService followService;
    private final UserService userService;

    @PostMapping("/{followedId}")
    @Operation(summary = "follow the user")
    public ResponseEntity<ApiResponseDTO> followUser(@PathVariable Long followedId, Principal principal) {
        String username = principal.getName();
        User follower = userService.findByUsername(username);
        return ResponseEntity.ok(followService.followUser(followedId, follower.getUserId()));
    }

    @GetMapping("/{userId}/count")
    @Operation(summary = "get follower count")
    public ResponseEntity<ApiResponseDTO> getFollowerCount(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowerCount(userId));
    }

    @GetMapping("/is-following/{followedId}")
    @Operation(summary = "check if the user is following")
    public ResponseEntity<ApiResponseDTO> isFollowing(@PathVariable Long followedId, Principal principal) {
        String username = principal.getName();
        User follower = userService.findByUsername(username);

        boolean isFollowing = followService.isFollowing(follower.getUserId(), followedId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Follow status fetched", isFollowing));
    }

    @GetMapping("/getFollowing")
    @Operation(summary = "get the followers")
    public ResponseEntity<ApiResponseDTO> getFollowing(@RequestParam Long userId) {
        List<FollowDTO> following = followService.getFollowingUsersById(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Following", following));
    }

    @GetMapping("/getFollwingDetails")
    @Operation(summary = "get details of followers")
    public ResponseEntity<ApiResponseDTO> getFollowingDetails(@RequestParam Long userId) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "Following",
                userService.getUsernameAndProfilePicByUserId(userId)));
    }

    @GetMapping("/{userId}/following")
    @Operation(summary = "get the followings by id")
    public ResponseEntity<ApiResponseDTO> getFollowings(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "Following list",
                followService.getFollowing(userId)
        ));
    }

    @GetMapping("/{userId}/followers")
    @Operation(summary = "get the followers by id")
    public ResponseEntity<ApiResponseDTO> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "Followers list",
                followService.getFollowers(userId)
        ));
    }
}
