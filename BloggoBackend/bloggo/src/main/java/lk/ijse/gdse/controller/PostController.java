package lk.ijse.gdse.controller;

import com.nimbusds.oauth2.sdk.http.HTTPResponse;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostBoostDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.PostService;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/post")
@CrossOrigin(origins = "http://localhost:63342",allowCredentials = "true")
public class PostController {
    private final PostService postService;
    private final UserService userService;

    @PostMapping("/publish")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> publishPost(@RequestBody Post post, Principal principal) {
        User user= userService.findByUsername(principal.getName());
        post.setUser(user);
        Post savedPost = postService.publishPost(post);
        return ResponseEntity.status(HTTPResponse.SC_CREATED).body(
                new ApiResponseDTO(
                        201,
                        "Post published successfully",
                        savedPost
                )
        );
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> getPost(
            @PathVariable Long postId,
            Principal principal
    ){
        PostBoostDTO postBoostDTO = postService.getPostBoostById(postId,  principal.getName());
        return ResponseEntity.ok(
                Map.of(
                        "status", 200,
                        "message", "Post retrieved successfully",
                        "data", postBoostDTO
                )
        );
    }
    @GetMapping("/my-posts")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO>getMyPosts(Principal principal) {
        List<PostDTO> posts = postService.getPostsByUser(principal.getName());
        return ResponseEntity.ok(
                new ApiResponseDTO(
                        200,
                        "Posts retrieved successfully",
                        posts
                )
        );
    }

    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> editPost(
            @PathVariable Long id,
            @RequestBody Post post,
            Principal principal) {

        Post existing = postService.getPostById(id);
        if (existing == null) {
            return ResponseEntity.status(404).body(new ApiResponseDTO(404, "Post not found", null));
        }
        if (!existing.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403).body(new ApiResponseDTO(403, "You are not allowed to edit this post", null));
        }

        existing.setTitle(post.getTitle());
        existing.setContent(post.getContent());
        existing.setCoverImageUrl(post.getCoverImageUrl());

        Post updated = postService.editPost(existing, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(200, "Post updated successfully", updated));
    }


    // ✅ Delete (owner only)
    @DeleteMapping("/delete/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> deletePost(@PathVariable Long postId, Principal principal) {
        Post existing = postService.getPostById(postId);
        if (existing == null) {
            return ResponseEntity.status(404).body(new ApiResponseDTO(404, "Post not found", null));
        }
        if (!existing.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403).body(new ApiResponseDTO(403, "You are not allowed to delete this post", null));
        }

        postService.deletePost(postId, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(200, "Post deleted successfully", null));
    }
}


