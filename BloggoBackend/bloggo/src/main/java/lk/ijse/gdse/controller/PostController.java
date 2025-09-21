package lk.ijse.gdse.controller;

import com.nimbusds.oauth2.sdk.http.HTTPResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostBoostDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.PostStatus;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.PostService;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/post")
@CrossOrigin(origins = "http://localhost:63342",allowCredentials = "true")
@Tag(name = "blog-posts", description = "Operations related to Blog-posts")

public class PostController {
    private final PostService postService;
    private final UserService userService;

    @PostMapping("/publish")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "publish a blog-post")
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

    @PostMapping("/draft")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "save the post as a draft")
    public ResponseEntity<ApiResponseDTO> saveDraft(@RequestBody Post post, Principal principal) {
        User user = userService.findByUsername(principal.getName());
        post.setUser(user);
        post.setStatus(PostStatus.DRAFT); // ✅ set draft status
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        Post savedPost = postService.publishPost(post); // create a generic save method
        return ResponseEntity.status(201).body(
                new ApiResponseDTO(201, "Post saved as draft", savedPost)
        );
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "schedule a post for publish")
    public ResponseEntity<ApiResponseDTO> schedulePost(@RequestBody Post post, Principal principal) {
        User user = userService.findByUsername(principal.getName());
        post.setUser(user);
        post.setStatus(PostStatus.SCHEDULED);
        post.setScheduledAt(post.getScheduledAt()); // expect scheduledAt in request
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        Post savedPost = postService.publishPost(post);
        return ResponseEntity.status(201).body(
                new ApiResponseDTO(201, "Post scheduled successfully", savedPost)
        );
    }

    @GetMapping("/{postId}")
    @Operation(summary = "get the post with postId")
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
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "get user posts according to the userId")
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
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "edit the blog-post")
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
        existing.setStatus(PostStatus.PUBLISHED);

        Post updated = postService.editPost(existing, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(200, "Post updated successfully", updated));
    }

    @DeleteMapping("/delete/{postId}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER', 'ADMIN')")
    @Operation(summary = "delete the blog-post")
    public ResponseEntity<ApiResponseDTO> deletePost(@PathVariable Long postId, Principal principal) {
        Post existing = postService.getPostById(postId);
        if (existing == null) {
            return ResponseEntity.status(404).body(new ApiResponseDTO(404, "Post not found", null));
        }

        postService.deletePost(postId, principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(200, "Post deleted successfully", null));
    }

    @GetMapping("/search/{keyword}")
    @Operation(summary = "search post by the keyword")
    public ResponseEntity<ApiResponseDTO> searchPosts(@PathVariable String keyword) {
        List<PostDTO> posts = postService.searchPosts(keyword);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Posts found", posts));
    }

    @GetMapping("getAll-pagination")
    @Operation(summary = "get posts with pagination")
    public ResponseEntity<ApiResponseDTO> getPosts(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "5") int size
    ) {
        if (size < 1) size = 5;
        if (page < 0) page = 0;

        Page<PostDTO> postPage = postService.getPosts(PageRequest.of(page, size));

        Map<String, Object> data = new HashMap<>();
        data.put("posts", postPage.getContent()); // only the content
        data.put("currentPage", postPage.getNumber());
        data.put("totalItems", postPage.getTotalElements());
        data.put("totalPages", postPage.getTotalPages());

        return ResponseEntity.ok(new ApiResponseDTO(200, "Posts retrieved successfully", data));
    }

}


