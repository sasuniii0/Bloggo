package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.CommentDTO;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/comment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")

public class CommentController {
    private final PostService postService;

    @PostMapping("{postId}")
    @PreAuthorize("hasRole('USER')") // Only users with the USER role can access this endpoint
    public ResponseEntity<ApiResponseDTO> addComment(
            @PathVariable Long postId,
            @RequestBody String content,
            Principal principal
    ){
        CommentDTO commentDTO = postService.addComment(postId, principal.getName(),content);
        return ResponseEntity.status(201).body(
                new ApiResponseDTO(
                        201,
                        "Comment added successfully",
                        commentDTO
                )
        );
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponseDTO> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDTO> comments = postService.getCommentsByPost(postId);
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Comments retrieved successfully",
                        comments
                )
        );
    }
}
