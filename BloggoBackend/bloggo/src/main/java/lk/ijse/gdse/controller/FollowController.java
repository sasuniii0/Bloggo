package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.repository.FollowRepository;
import lk.ijse.gdse.service.FollowService;
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

    @PostMapping("/{followedId}/by/{followerId}")
    public ResponseEntity<ApiResponseDTO> follow (
            @PathVariable Long followedId,
            @PathVariable Long followerId, Principal principal
    ){
        return ResponseEntity.ok(followService.followUser(followedId,followerId));
    }

    @GetMapping("/{userId}/count")
    public ResponseEntity<ApiResponseDTO> followerCount(@PathVariable Long userId) {
        return ResponseEntity.ok(
                followService.getFollowerCount(userId)
        );
    }
}
