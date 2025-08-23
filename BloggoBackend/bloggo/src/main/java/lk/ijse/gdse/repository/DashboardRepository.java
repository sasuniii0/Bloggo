package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Post,Long> {
    @Query
            ("SELECT DISTINCT p FROM Post p " +
                    "JOIN p.user u " +
                    "JOIN p.tags t " +
                    "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                    "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> findByKeyword(@Param("keyword") String keyword);
}
