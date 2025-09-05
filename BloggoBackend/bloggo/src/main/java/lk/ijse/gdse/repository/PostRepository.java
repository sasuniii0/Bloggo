package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserUsername(String username); // <-- fetch by username

    Post findByPostId(Long postId);

    // Fetch top 10 posts ordered by creation date (most recent first)
    List<Post> findTop10ByOrderByCreatedAtDesc();

    // Optional: only published posts
    List<Post> findTop10ByStatusOrderByCreatedAtDesc(PostStatus status);

}
