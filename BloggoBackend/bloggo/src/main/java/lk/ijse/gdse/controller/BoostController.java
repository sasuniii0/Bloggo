package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostBoostDTO;
import lk.ijse.gdse.service.BoostService;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final BoostService boostService;

    @PostMapping("/{postId}")
    @PreAuthorize("hasRole('USER')") // Only users with the USER role can access this endpoint
    public ResponseEntity<ApiResponseDTO> boostPost(@PathVariable Long postId, Principal principal) {
        postService.boostPost(postId, principal.getName());
        PostBoostDTO postBoostDTO = postService.getPostBoostById(postId,principal.getName());
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Post boosted successfully",
                        postBoostDTO
                )
        );
    }

    @PostMapping("/unboost/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> unboostPost(@PathVariable Long postId, Principal principal) {
        boostService.unboostPost(postId, principal.getName());
        PostBoostDTO postBoostDTO = postService.getPostBoostById(postId,principal.getName());
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Post unboosted successfully",
                        postBoostDTO
                )
        );
    }

    @GetMapping("/status/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> getBoostStatus(@PathVariable Long postId, Principal principal) {
        PostBoostDTO postBoostDTO = postService.getPostBoostById(postId, principal.getName());
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Boost status fetched",
                        postBoostDTO
                ));
    }

    @DeleteMapping("/delete/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> deletePost(@PathVariable Long postId, Principal principal) {
        boostService.deleteBoost(postId, principal.getName());
        return new ResponseEntity<>(new ApiResponseDTO(
                200,
                "removed boost successfully",
                null
        ), HttpStatus.OK);
    }
}
