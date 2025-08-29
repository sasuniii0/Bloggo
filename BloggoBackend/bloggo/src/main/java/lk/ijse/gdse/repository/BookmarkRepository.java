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

    List<Bookmark> findByUser(User user);

    Long countByPost(Post post);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
            "FROM Bookmark b WHERE b.post.postId = :postId AND b.user.userId = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") Long postId,
                                    @Param("userId") Long userId);

    void deleteByPostAndUser(Post post, User user);
}
