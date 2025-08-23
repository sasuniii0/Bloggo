package lk.ijse.gdse.controller;

import com.nimbusds.oauth2.sdk.http.HTTPResponse;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/post")
@CrossOrigin(origins = "http://localhost:63342",allowCredentials = "true")
public class PostController {
    private final PostService postService;

    @PostMapping("/publish")
    public ResponseEntity<ApiResponseDTO> publishPost(@RequestBody Post post) {
        Post savedPost = postService.publishPost(post);
        return ResponseEntity.status(HTTPResponse.SC_CREATED).body(
                new ApiResponseDTO(
                        201,
                        "Post published successfully",
                        savedPost
                )
        );
    }
    @GetMapping("/get")
    public String getString() {
        return "Hello, this is a test endpoint for PostController!";
    }
}
