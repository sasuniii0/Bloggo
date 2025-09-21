package lk.ijse.gdse.service.impl;

import jakarta.transaction.Transactional;
import lk.ijse.gdse.dto.CommentDTO;
import lk.ijse.gdse.dto.PostBoostDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.*;
import lk.ijse.gdse.exception.ResourceNotFoundException;
import lk.ijse.gdse.exception.UserNotFoundException;
import lk.ijse.gdse.repository.*;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final EarningRepository earningRepository;
    private final BoostRepository boostRepository;
    private final NotificationRepository notificationRepository;
    private final SendGridEmailServiceImpl sendGridEmailService;

    @Override
    public Post publishPost(Post post) {
        User user = userRepository.findById(post.getUser().getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
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
    public void deletePost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User actingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Allow deletion if the user is:
        // 1. The post owner OR
        // 2. Admin
        if (!post.getUser().getUsername().equals(username) && actingUser.getRole() != RoleName.ADMIN) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        User user = post.getUser();
        // Send login notification
        try {
            sendGridEmailService.sendPostDeleteNotificationEmail(user.getEmail(), username);
        } catch (Exception e) {
            System.err.println("Failed to send login notification: " + e.getMessage());
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
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!existingPost.getUser().getUsername().equals(name)) {
            throw new UserNotFoundException("You are not authorized to edit this post");
        }
        existingPost.setTitle(post.getTitle());
        existingPost.setContent(post.getContent());
        existingPost.setCoverImageUrl(post.getCoverImageUrl());
        existingPost.setStatus(post.getStatus());
        existingPost.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(existingPost);
    }

    @Transactional
    @Override
    public int boostPost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User boostingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (post.getBoosts() == null) {
            post.setBoosts(new ArrayList<>());
        }

        Boost existingBoost = post.getBoosts().stream()
                .filter(b -> b.getUser().equals(boostingUser))
                .findFirst()
                .orElse(null);

        if (existingBoost != null) {
            post.getBoosts().remove(existingBoost);
        } else {
            Boost newBoost = Boost.builder()
                    .post(post)
                    .user(boostingUser)
                    .createdAt(LocalDateTime.now())
                    .build();
            boostRepository.save(newBoost);
            post.getBoosts().add(newBoost);

            // --- SEND NOTIFICATION TO POST OWNER ---
            User postOwners = post.getUser();
            if (!boostingUser.equals(postOwners)) {
                Notification notification = Notification.builder()
                        .user(postOwners)
                        .message(boostingUser.getUsername() + " boosted your post: " + post.getTitle())
                        .type(Type.BOOST)
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
            }

            User postOwner = post.getUser();

            if (RoleName.MEMBER.equals(postOwner.getRole())){
                Wallet postOwnerWallet = postOwner.getWallet();
                if (postOwnerWallet == null) {
                    postOwnerWallet = Wallet.builder()
                            .userId(postOwner)
                            .balance(0.0)
                            .createdAt(LocalDateTime.now())
                            .build();
                    walletRepository.save(postOwnerWallet);

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

                walletRepository.save(postOwnerWallet);
                earningRepository.save(earning);
            }
        }
        postRepository.save(post);
        return post.getBoosts().size();
    }

    @Override
    public CommentDTO addComment(Long postId, String username, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());

        // --- SEND NOTIFICATION TO POST OWNER ---
        User postOwner = post.getUser();
        if (!user.getUserId().equals(postOwner.getUserId())) {
            Notification notification = Notification.builder()
                    .user(postOwner)
                    .message(user.getUsername() + " commented on your post: " + post.getTitle()
                            + " → \"" + content + "\"")
                    .type(Type.COMMENT)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        }

        if (post.getComments() == null) {
            post.setComments(new ArrayList<>());
        }
        post.getComments().add(comment);
        postRepository.save(post);

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
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

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

    @Override
    public PostBoostDTO getPostBoostById(Long postId, String name) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        boolean hasBoosted = post.getBoosts().stream()
                .anyMatch(boost -> boost.getUser().equals(user));

        return PostBoostDTO.builder()
                .id(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .username(post.getUser().getUsername())
                .imageUrl(post.getCoverImageUrl())
                .publishedAt(post.getPublishedAt())
                .boostCount(post.getBoosts().size())
                .boostedByCurrentUser(hasBoosted)
                .build();
    }

    @Override
    public List<PostDTO> searchPosts(String keyword) {
        List<Post> posts = postRepository.searchPostsByKeyword(keyword);
        return posts.stream()
                .map(p -> new PostDTO(
                        p.getPostId(),
                        p.getTitle(),
                        p.getUser().getUsername()
                ))
                .toList();
    }

    @Override
    public Page<PostDTO> getPosts(Pageable of) {
       Page <Post> posts = postRepository.findAll(of);
       return posts.map(post -> new PostDTO(
               post.getPostId(),
               post.getTitle(),
               post.getContent(),
               post.getUser().getUsername(),
               post.getCoverImageUrl(),
               post.getStatus(),
               post.getPublishedAt(),
               post.getBoosts() != null ? post.getBoosts().size() : 0,
               post.getComments() != null ? post.getComments().size() : 0
       ));
    }

    public List<PostDTO> getPostsByUserId(Long userId) {
        List<Post> posts = postRepository.findAllByUserUserId(userId);
        return posts.stream()
                .map(post -> new PostDTO(
                        post.getPostId(),
                        post.getTitle(),
                        post.getCoverImageUrl(),
                        post.getContent(),
                        post.getPublishedAt()
                ))
                .collect(Collectors.toList());
    }
}
