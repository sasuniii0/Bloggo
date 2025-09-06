package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardRepository extends JpaRepository<Post,Long> {
    @Query("""
       SELECT DISTINCT p FROM Post p
       JOIN p.user u
       LEFT JOIN p.tags t
       WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
       """)
    List<Post> findByKeyword(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT p FROM Post p " +
            "LEFT JOIN p.tags t " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY p.createdAt DESC")
    List<Post> searchPostsByKeyword(@Param("keyword") String keyword);
}
