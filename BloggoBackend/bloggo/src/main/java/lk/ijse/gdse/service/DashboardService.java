package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.Post;

import java.util.List;

public interface DashboardService {
    List<Post> serachByKeyword(String keyword);
    List<PostDTO> getAllPosts();
    List<UserDTO> getAllUsers();
    PostDTO getPostById(Long postId);
    List<PostDTO> getRecentPublishedPosts();
}
