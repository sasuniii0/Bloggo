package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.FollowDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.Follow;
import lk.ijse.gdse.entity.User;

import java.util.List;

public interface FollowService {
    ApiResponseDTO followUser(Long followedId, Long followerId);

    ApiResponseDTO getFollowerCount(Long userId);

    boolean isFollowing(Long userId, Long followedId);

    List<FollowDTO> getFollowingUsersById(Long userId);

    List<UserDTO> getFollowing(Long userId);

    List<UserDTO> getFollowers(Long userId);
}
