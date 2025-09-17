package lk.ijse.gdse.repository;

import lk.ijse.gdse.dto.PostDTO;
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

    @Query("""
    SELECT new lk.ijse.gdse.dto.PostDTO(
        p.postId,
        p.title,
        p.content,
        p.user.username,
        p.coverImageUrl,
        p.status,
        p.publishedAt,
        SIZE(p.boosts),
        SIZE(p.comments)
    )
    FROM Post p
    WHERE p.status = :status
    ORDER BY p.createdAt DESC
""")
    List<PostDTO> findTop10PublishedPosts(@Param("status") PostStatus status);


    @Query("SELECT DISTINCT p FROM Post p " +
            "LEFT JOIN p.tags t " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY p.createdAt DESC")
    List<Post> searchPostsByKeyword(@Param("keyword") String keyword);

    @Query("SELECT MONTH(p.createdAt) as month, COUNT(p) as count FROM Post p GROUP BY MONTH(p.createdAt) ORDER BY MONTH(p.createdAt)")
    List<Object[]> getMonthlyPostStats();

    List<Post> getPostsByUserUserId(Long userId);

    List<Post> findAllByUserUserId(Long userId);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.userId = :userId")
    Long countPostsByUserId(@Param("userId") Long userId);

}
