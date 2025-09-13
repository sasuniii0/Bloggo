package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.PaginationDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.*;
import lk.ijse.gdse.repository.*;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.Sort;
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
    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;

    @Override
    public User saveUser(User user) {
        // Save the user first
        User userSaved = userRepository.save(user);

        if (!walletRepository.existsByUserId(userSaved)) {
            Wallet wallet = Wallet.builder()
                    .userId(userSaved)
                    .balance(0.0)
                    .createdAt(LocalDateTime.now())
                    .build();
            walletRepository.save(wallet);
        }


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
                user.getFollowing() != null ? user.getFollowing().size() : 0,
                user.getRole().name()
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
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User upgradeMembership(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setMembershipStatus(MembershipStatus.PAID);
        user.setRole(RoleName.MEMBER);

        // 2️⃣ Send congratulatory notification
        Notification notification = Notification.builder()
                .user(user)
                .message("Congratulations, " + user.getUsername() + "! Your membership is now upgraded. 🎉")
                .type(Type.MEMBERSHIP_SUCCESS) // Make sure your enum has a PAYMENT type
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        // Create wallet if not exists
        if (user.getWallet() == null) {
            Wallet wallet = Wallet.builder()
                    .userId(user)
                    .balance(0.0)
                    .createdAt(LocalDateTime.now())
                    .build();
            walletRepository.save(wallet);

            user.setWallet(wallet);
        }

        return userRepository.save(user);
    }

    @Override
    public User getLoggedInUser(String username) {
        return userRepository.findByUsername(username).orElseThrow();
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

    @Override
    public Page<PaginationDTO> getUsersForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return userRepository.findAll(pageable)
                .map(user -> {
                    AdminAction latestAction = null;
                    if (user.getAdminActions() != null && !user.getAdminActions().isEmpty()) {
                        latestAction = user.getAdminActions().stream()
                                .sorted((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()))
                                .findFirst()
                                .orElse(null);
                    }
                    return new PaginationDTO(
                            user.getUserId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole(),
                            latestAction
                    );
                });
    }

    @Override
    public Page<PaginationDTO> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);

        return users.map(user -> PaginationDTO.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole(): null)
                .action(null) // later you can fetch latest AdminAction if required
                .build()
        );
    }

    @Override
    public List<UserDTO> getAllMembersExcludingAdminAndSelf(Long loggedUserId) {
        List<User> users = userRepository.findByRoleNotAndUserIdNotOrderByCreatedAtDesc(RoleName.ADMIN, loggedUserId);
        return users.stream()
                .map(u -> new UserDTO(u.getUserId(), u.getUsername(), u.getProfileImage(),u.getMembershipStatus(), u.getRole()))
                .toList();
    }

    @Override
    public UserDTO getUserDTOById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return new UserDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImage(),
                user.getBio(),
                user.getMembershipStatus(),
                user.getRole()
        );
    }

    @Override
    public List<UserDTO> getAllMembersExcludingLoggedUserAndProfileOwner(Long loggedUserId, Long profileOwnerId) {
        List<User> users = userRepository.findByRoleNotAndUserIdNotInOrderByCreatedAtDesc(
                RoleName.ADMIN,
                List.of(loggedUserId, profileOwnerId)
        );
        return users.stream()
                .map(u -> new UserDTO(u.getUserId(), u.getUsername(), u.getProfileImage(),u.getMembershipStatus(), u.getRole()))
                .toList();
    }

    @Override
    public Optional<User> findUserById(Long userId) {
        return userRepository.findById(userId);    }

    @Override
    public void updateUser(User user) {
        userRepository.save(user); // only save, no wallet creation
    }


}
