package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Bookmark;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByPostAndUser(Post post, User user);

    // Find all bookmarks by user
    List<Bookmark> findByUser(User user);

    // Count bookmarks for a post
    Long countByPost(Post post);

    // Check if post is bookmarked by user (boolean)
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
            "FROM Bookmark b WHERE b.post.postId = :postId AND b.user.userId = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    // Delete bookmark by post and user
    void deleteByPostAndUser(Post post, User user);
}
