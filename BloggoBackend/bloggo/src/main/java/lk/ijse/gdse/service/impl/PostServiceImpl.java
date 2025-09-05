package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.CommentDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.*;
import lk.ijse.gdse.repository.EarningRepository;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.repository.WalletRepository;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final EarningRepository earningRepository;

    @Override
    public Post publishPost(Post post) {
        User user = userRepository.findById(post.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        post.setCoverImageUrl(post.getCoverImageUrl());
        post.setTitle(post.getTitle());
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
                        post.getCoverImageUrl(),
                        post.getStatus(),
                        post.getPublishedAt(),
                        post.getBoosts() != null ? post.getBoosts().size() : 0,
                        post.getComments() != null ? post.getComments().size() : 0
                ))
                .toList();
    }

    @Override
    public List<PostDTO>   getPostsByUser(String name) {
        List<Post> posts = postRepository.findByUserUsername(name);
        return posts.stream()
                .map(post -> new PostDTO(
                        post.getPostId(),
                        post.getTitle(),
                        post.getContent(),
                        post.getUser().getUsername(),
                        post.getCoverImageUrl(),
                        post.getStatus(),
                        post.getPublishedAt(),
                        post.getBoostCount(),
                        post.getCommentsCount())
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

    @Override
    public int boostPost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User boostinguser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getBoosts()== null){
            post.setBoosts(new ArrayList<>());
        }

        Boost existingBoost = post.getBoosts().stream()
                .filter(b -> b.getUser().equals(boostinguser))
                .findFirst().orElse(null);

        if (existingBoost != null) {
            post.getBoosts().remove(existingBoost);
        }else{
            Boost newBoost =Boost.builder()
                    .user(boostinguser)
                    .post(post)
                    .createdAt(LocalDateTime.now())
                    .build();
            post.getBoosts().add(newBoost);

            // create earnings
            Wallet postOwnerWallet = post.getUser().getWallet();
            if (postOwnerWallet == null) {
                throw new RuntimeException("post owner has no wallet");
            }

            Earning earning = Earning.builder()
                    .walletId(postOwnerWallet)
                    .source(Source.BOOST)
                    .amount(1.0)
                    .post(post)
                    .createdAt(LocalDateTime.now())
                    .build();

            postOwnerWallet.setBalance(postOwnerWallet.getBalance() + earning.getAmount());
            postOwnerWallet.getEarnings().add(earning);

            walletRepository.save(postOwnerWallet);
            earningRepository.save(earning);

        }

        postRepository.save(post);
        return post.getBoosts().size();



       /* Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getBoosts() == null) {
            post.setBoosts(new ArrayList<>());
        }

        // check if this user already boosted
        Boost existingBoost = post.getBoosts().stream()
                .filter(b -> b.getUser().equals(user))
                .findFirst()
                .orElse(null);

        if (existingBoost != null) {
            // user already boosted → remove
            post.getBoosts().remove(existingBoost);
        } else {
            // user has not boosted → add
            Boost newBoost = Boost.builder()
                            .user(user)
                                    .post(post)
                                            .createdAt(LocalDateTime.now())
                                                    .build();

            post.getBoosts().add(newBoost);
        }

        postRepository.save(post);
        return post.getBoosts().size();*/
    }



    @Override
    public CommentDTO addComment(Long postId, String username, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());

        if (post.getComments() == null) {
            post.setComments(new ArrayList<>());
        }
        post.getComments().add(comment);

        postRepository.save(post); // Save post with new comment

        return new CommentDTO(
                comment.getCommentId(),
                comment.getContent(),
                comment.getUser().getUsername()
        );
    }


    @Override
    public List<CommentDTO> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getComments() == null) return List.of();

        return post.getComments().stream()
                .map(c -> new CommentDTO(
                        c.getCommentId(),
                        c.getContent(),
                        c.getUser().getUsername()
                ))
                .toList();
    }



}
