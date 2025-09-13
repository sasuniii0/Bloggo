package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.PostStatus;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.DashboardRepository;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final DashboardRepository dashboardRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    public List<Post> serachByKeyword(String keyword) {
        return dashboardRepository.searchPostsByKeyword(keyword);
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
    public List<UserDTO> getAllUsers() {
        return userRepository.findUserByRole(RoleName.USER)
                .stream()
                .map(user -> new UserDTO(user.getUserId(), user.getUsername()))
                .collect(Collectors.toList());

    }


    @Override
    public PostDTO getPostById(Long postId) {
        Post post= postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return PostDTO.builder()
                .id(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .username(post.getUser().getUsername())
                .imageUrl(post.getCoverImageUrl())
                .status(post.getStatus())
                .publishedAt(post.getPublishedAt())
                .boostCount(post.getBoosts() != null ? post.getBoosts().size() : 0)
                .commentsCount(post.getComments() != null ? post.getComments().size() : 0)
                .build();
    }

    @Override
    public List<PostDTO> getRecentPublishedPosts() {
        return postRepository.findTop10PublishedPosts(PostStatus.PUBLISHED);

    }

}
