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

    @Query("SELECT DISTINCT p FROM Post p " +
            "LEFT JOIN p.tags t " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY p.createdAt DESC")
    List<Post> searchPostsByKeyword(@Param("keyword") String keyword);
}
