package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("SELECT MONTH(c.createdAt) as month, COUNT(c) as count FROM Comment c GROUP BY MONTH(c.createdAt) ORDER BY MONTH(c.createdAt)")
    List<Object[]> getMonthlyCommentStats();}
