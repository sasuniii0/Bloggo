package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.Post;

import java.util.List;

public interface PostService {
    Post publishPost(Post post);

    List<PostDTO> getAllPosts();

    List<PostDTO> getPostsByUser(String name);

    void deletePost(Long postId, String name);

    Post getPostById(Long postId);

    Post editPost(Post post, String name);
}
