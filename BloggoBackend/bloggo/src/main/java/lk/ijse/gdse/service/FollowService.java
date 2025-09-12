package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.ApiResponseDTO;

public interface FollowService {
    ApiResponseDTO followUser(Long followedId, Long followerId);

    ApiResponseDTO getFollowerCount(Long userId);

    boolean isFollowing(Long userId, Long followedId);
}
