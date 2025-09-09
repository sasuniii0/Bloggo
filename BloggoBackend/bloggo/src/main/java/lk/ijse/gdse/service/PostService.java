package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.CommentDTO;
import lk.ijse.gdse.dto.PostBoostDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    Post publishPost(Post post);

    List<PostDTO> getAllPosts();

    List<PostDTO> getPostsByUser(String name);

    void deletePost(Long postId, String name);

    Post getPostById(Long postId);

    Post editPost(Post post, String name);

    int boostPost(Long postId, String name);

    CommentDTO addComment(Long postId, String name, String content);

    List<CommentDTO> getCommentsByPost(Long postId);

    PostBoostDTO getPostBoostById(Long postId, String name);

    List<PostDTO> searchPosts(String keyword);

    Page<PostDTO> getPosts(Pageable of);
}
