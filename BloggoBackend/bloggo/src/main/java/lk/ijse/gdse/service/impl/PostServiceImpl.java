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
    public List<PostDTO> getPostsByUser(String name) {
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
        // Fetch the post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Fetch the boosting user
        User boostingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getBoosts() == null) {
            post.setBoosts(new ArrayList<>());
        }

        // Check if user already boosted this post (toggle)
        Boost existingBoost = post.getBoosts().stream()
                .filter(b -> b.getUser().equals(boostingUser))
                .findFirst()
                .orElse(null);

        if (existingBoost != null) {
            // Remove boost
            post.getBoosts().remove(existingBoost);
        } else {
            // Create new boost
            Boost newBoost = Boost.builder()
                    .post(post)
                    .user(boostingUser)
                    .createdAt(LocalDateTime.now())
                    .build();
            post.getBoosts().add(newBoost);

            // Ensure post owner has a wallet
            User postOwner = post.getUser();
            Wallet postOwnerWallet = postOwner.getWallet();
            if (postOwnerWallet == null) {
                postOwnerWallet = Wallet.builder()
                        .userId(postOwner)
                        .balance(0.0)
                        .createdAt(LocalDateTime.now())
                        .build();
                walletRepository.save(postOwnerWallet);

                // Associate wallet with user
                postOwner.setWallet(postOwnerWallet);
                userRepository.save(postOwner);
            }

            // Add earning for the post owner
            Earning earning = Earning.builder()
                    .walletId(postOwnerWallet)
                    .post(post)
                    .source(Source.BOOST)
                    .amount(1.0)
                    .createdAt(LocalDateTime.now())
                    .build();

            if (postOwnerWallet.getEarnings() == null) {
                postOwnerWallet.setEarnings(new ArrayList<>());
            }
            postOwnerWallet.getEarnings().add(earning);
            postOwnerWallet.setBalance(postOwnerWallet.getBalance() + earning.getAmount());

            // Save wallet and earning
            walletRepository.save(postOwnerWallet);
            earningRepository.save(earning);
        }

        // Save post with updated boosts
        postRepository.save(post);

        return post.getBoosts().size();
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
                comment.getUser().getUsername(),
                comment.getUser().getProfileImage(),
                comment.getCreatedAt()
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
                        c.getUser().getUsername(),
                        c.getUser().getProfileImage(),
                        c.getCreatedAt()
                ))
                .toList();
    }



}
