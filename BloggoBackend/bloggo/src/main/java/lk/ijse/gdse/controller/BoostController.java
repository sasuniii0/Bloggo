package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/boost")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")

public class BoostController {
    private final PostService postService;

    @PostMapping("/{postId}")
    @PreAuthorize("hasRole('USER')") // Only users with the USER role can access this endpoint
    public ResponseEntity<ApiResponseDTO> boostPost(@PathVariable Long postId, Principal principal) {
        int newBoostCount = postService.boostPost(postId, principal.getName());
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Post boosted successfully",
                        newBoostCount
                )
        );
    }
}
