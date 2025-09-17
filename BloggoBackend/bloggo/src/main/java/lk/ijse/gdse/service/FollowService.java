package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.FollowDTO;
import lk.ijse.gdse.entity.Follow;

import java.util.List;

public interface FollowService {
    ApiResponseDTO followUser(Long followedId, Long followerId);

    ApiResponseDTO getFollowerCount(Long userId);

    boolean isFollowing(Long userId, Long followedId);

    List<FollowDTO> getFollowingUsersById(Long userId);
}
