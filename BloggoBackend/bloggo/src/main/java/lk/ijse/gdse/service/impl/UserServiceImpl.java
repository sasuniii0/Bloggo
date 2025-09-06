package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.entity.Wallet;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.repository.WalletRepository;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final WalletRepository walletRepository;

    @Override
    public User saveUser(User user) {
        // Save the user first
        User userSaved = userRepository.save(user);

        // Create a wallet for the saved user
        Wallet wallet = Wallet.builder()
                .userId(userSaved)  // associate wallet with the saved user
                .balance(0.0)
                .createdAt(LocalDateTime.now())
                .build();

        walletRepository.save(wallet); // save the wallet

        return userSaved; // return the saved user
    }


    @Override
    public User editUser(User user) {
        User existing = userRepository.getUserByUserId(user.getUserId());
        existing.setUsername(user.getUsername());
        existing.setEmail(user.getEmail());
        existing.setRole(user.getRole());
        return userRepository.save(existing);
    }

    @Override
    public void deleteUser(Long userId) {
        User existing = userRepository.getUserByUserId(userId);
        userRepository.delete(existing);
    }

    @Override
    public List<UserDTO> getUsers(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset, limit);
        return userRepository.findAll(pageable)
                .stream()
                .map(user -> new UserDTO(user.getUserId(), user.getUsername()))
                .collect(Collectors.toList());
    }

    @Override
    public UserProfileDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserProfileDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImage(),
                user.getBio(),
                user.getFollowers() != null ? user.getFollowers().size() : 0,
                user.getFollowing() != null ? user.getFollowing().size() : 0
        );
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateProfileUser(User existing, String loggedUsername) {
        User existingUser = userRepository.findById(existing.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<User> duplicateUsername = userRepository.findByUsername(existing.getUsername());
        if (duplicateUsername.isPresent() && !duplicateUsername.get().getUserId().equals(existing.getUserId())) {
            throw new RuntimeException("Username already exists");
        }

        existingUser.setUsername(existing.getUsername());
        existingUser.setEmail(existing.getEmail());
        existingUser.setBio(existing.getBio());
        existingUser.setProfileImage(existing.getProfileImage());
        return userRepository.save(existingUser);
    }

    @Override
    public User updateProfile(String loggedUsername, String username, String email, String bio, MultipartFile profileImage) throws IOException {
        User user = userRepository.findByUsername(loggedUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(username);
        user.setEmail(email);
        user.setBio(bio);

        if (profileImage != null && !profileImage.isEmpty()) {
            String uploadDir = "uploads/profile_images";
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + profileImage.getOriginalFilename();
            profileImage.transferTo(new File(uploadPath, fileName));
            user.setProfileImage(uploadDir + "/" + fileName);
        }

        return userRepository.save(user);
    }

    @Override
    public User findByUsername(String name) {
        return userRepository.findByUsername(name)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + name));
    }

    @Override
    public List<UserDTO> getUserByRole(String user) {
        List<User> recentUsers = userRepository.findTop5ByRoleOrderByCreatedAtDesc(RoleName.USER);

        return recentUsers.stream()
                .map(u -> new UserDTO(
                        u.getUserId(),
                        u.getUsername(),
                        u.getProfileImage()
                ))
                .collect(Collectors.toList());

    }

    @Override
    public List<PostDTO> getUserPosts(String username) {
        List<Post> posts = postRepository.findByUserUsername(username);

        return posts.stream()
                .map(p->PostDTO.builder()
                        .id(p.getPostId())
                        .title(p.getTitle())
                        .content(p.getContent())
                        .username(p.getUser().getUsername())
                        .imageUrl(p.getCoverImageUrl())
                        .status(p.getStatus())
                        .publishedAt(p.getPublishedAt())
                        .boostCount(p.getBoostCount())
                        .commentsCount(p.getCommentsCount())
                        .build()
                ).toList();
    }

    @Override
    public List<UserDTO> searchUsers(String keyword) {
        return userRepository.searchUsersByKeyword(keyword)
                .stream()
                .map(u -> new UserDTO(
                        u.getUserId(),
                        u.getUsername(),
                        u.getProfileImage()
                ))
                .collect(Collectors.toList());
    }
}
