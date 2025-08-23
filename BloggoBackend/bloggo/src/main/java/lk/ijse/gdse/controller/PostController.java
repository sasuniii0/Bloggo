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

    @GetMapping("/get")
    public String getString() {
        return "Hello, this is a test endpoint for PostController!";
    }
}
