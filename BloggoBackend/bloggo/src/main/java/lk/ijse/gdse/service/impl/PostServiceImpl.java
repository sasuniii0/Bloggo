package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    public Post publishPost(Post post) {
        User user = userRepository.findById(post.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        post.setPublishedAt(LocalDateTime.now());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    @Override
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> new PostDTO(
                        post.getPostId(),
                        post.getTitle(),
                        post.getContent(),
                        post.getUser().getUsername(),
                        post.getStatus(),
                        post.getPublishedAt()
                ))
                .toList();
    }

    @Override
    public List<PostDTO> getPostsByUser(String name) {
        List<Post> posts = postRepository.findByUserUsername(name);
        return posts.stream()
                .map(post -> new PostDTO(
                        post.getPostId(),
                        post.getTitle(),
                        post.getContent(),
                        post.getUser().getUsername(),
                        post.getStatus(),
                        post.getPublishedAt())
                )
                .toList();
    }

    @Override
    public void deletePost(Long postId, String name) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getUsername().equals(name)) {
            throw new RuntimeException("You are not authorized to delete this post");
        }
        postRepository.delete(post);
    }

    @Override
    public Post getPostById(Long postId) {
        return postRepository.findByPostId(postId);
    }

    @Override
    public Post editPost(Post post, String name) {
        Post existingPost = postRepository.findById(post.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!existingPost.getUser().getUsername().equals(name)) {
            throw new RuntimeException("You are not authorized to edit this post");
        }
        existingPost.setTitle(post.getTitle());
        existingPost.setContent(post.getContent());
        existingPost.setCoverImageUrl(post.getCoverImageUrl());
        existingPost.setStatus(post.getStatus());
        existingPost.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(existingPost);
    }


}
