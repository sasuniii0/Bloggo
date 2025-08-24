package lk.ijse.gdse.controller;

import com.nimbusds.oauth2.sdk.http.HTTPResponse;
import lk.ijse.gdse.dto.ApiResponseDTO;
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

    @PutMapping("/edit")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> editPost(@RequestBody Post post, Principal principal) {
        User user = userService.findByUsername(principal.getName());

        Post existingPost = postService.getPostById(post.getPostId());
        if (existingPost == null) {
            return ResponseEntity.status(404)
                    .body(new ApiResponseDTO(404, "Post not found", null));
        }

        if (!existingPost.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403)
                    .body(new ApiResponseDTO(403, "You are not allowed to edit this post", null));
        }

        existingPost.setTitle(post.getTitle());
        existingPost.setContent(post.getContent());
        Post updatedPost = postService.editPost(existingPost);

        return ResponseEntity.ok(new ApiResponseDTO(200, "Post updated successfully", updatedPost));
    }

    // ✅ Delete post only if owner
    @DeleteMapping("/delete/{postId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> deletePost(@PathVariable Long postId, Principal principal) {
        Post existingPost = postService.getPostById(postId);
        if (existingPost == null) {
            return ResponseEntity.status(404)
                    .body(new ApiResponseDTO(404, "Post not found", null));
        }

        if (!existingPost.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403)
                    .body(new ApiResponseDTO(403, "You are not allowed to delete this post", null));
        }

        postService.deletePost(postId, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(200, "Post deleted successfully", null));
    }
}


