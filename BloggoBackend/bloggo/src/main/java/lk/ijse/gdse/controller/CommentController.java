package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.CommentDTO;
import lk.ijse.gdse.service.CommentService;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")

public class CommentController {
    private final PostService postService;
    private final CommentService commentService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponseDTO> addComment(
            @PathVariable Long postId,
            @RequestBody Map<String, String> request,
            Principal principal
    ) {
        String content = request.get("content");
        CommentDTO commentDTO = postService.addComment(postId, principal.getName(), content);
        return ResponseEntity.status(201).body(
                new ApiResponseDTO(201, "Comment added successfully", commentDTO)
        );
    }

    @DeleteMapping("{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    public ResponseEntity<ApiResponseDTO> deleteComment(@PathVariable Long commentId, Principal principal) {
        commentService.deleteComment(commentId, principal.getName());
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "comment deleted Successfully",
                        null
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
