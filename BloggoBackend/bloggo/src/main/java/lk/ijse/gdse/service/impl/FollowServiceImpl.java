package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.FollowDTO;
import lk.ijse.gdse.entity.*;
import lk.ijse.gdse.repository.*;
import lk.ijse.gdse.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private static final double FOLLOW_EARNING_AMOUNT = 0.5;

    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final EarningRepository earningRepository;

    @Transactional
    @Override
    public ApiResponseDTO followUser(Long followedId, Long followerId) {
        if (followedId.equals(followerId)) {
            return new ApiResponseDTO(400, "You cannot follow yourself", null);
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("Follower not found"));

        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new IllegalArgumentException("Followed user not found"));

        if (followRepository.existsByFollowerAndFollowed(follower, followed)) {
            return new ApiResponseDTO(400, "Already followed", null);
        }

        // Save follow
        Follow follow = Follow.builder()
                .follower(follower)
                .followed(followed)
                .createdAt(LocalDateTime.now())
                .build();
        followRepository.save(follow);

        Notification notification = Notification.builder()
                .user(follower) // who receives the notification (logged-in user)
                .message(follower.getUsername() +" followed " + followed.getUsername())
                .createdAt(LocalDateTime.now())
                .type(Type.FOLLOW) // optional enum type
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        // Reward followed user if MEMBER
        if (isMember(followed)) {
            Wallet wallet = walletRepository.findByUserId_UserId(followed.getUserId());

            Earning earning = Earning.builder()
                    .walletId(wallet)
                    .post(null) // no post associated
                    .amount(FOLLOW_EARNING_AMOUNT)
                    .source(Source.FOLLOW)
                    .createdAt(LocalDateTime.now())
                    .build();

            earningRepository.save(earning);

            // Update wallet balance
            wallet.setBalance(wallet.getBalance() + FOLLOW_EARNING_AMOUNT);
            walletRepository.save(wallet);
        }

        return new ApiResponseDTO(200, "Follow successful", null);
    }

    @Override
    public ApiResponseDTO getFollowerCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long count = followRepository.countByFollowed(user);
        return new ApiResponseDTO(200, "Follower count fetched", count);
    }

    private boolean isMember(User user) {
        return user.getRole() == RoleName.MEMBER;
    }

    @Override
    public boolean isFollowing(Long followerId, Long followedId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("Follower not found"));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new IllegalArgumentException("Followed user not found"));

        return followRepository.existsByFollowerAndFollowed(follower, followed);
    }

    @Override
    public List<FollowDTO> getFollowingUsersById(Long userId) {
        return followRepository.getFollowsByFollowerId(userId);
    }

}
