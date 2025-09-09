package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Boost;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoostRepository extends JpaRepository<Boost, Long> {
    boolean existsByUserAndPost(User user, Post post);
    Long countByPost(Post post);
    Optional<Boost> findByUserAndPost(User user, Post post);

    @Query("SELECT MONTH(b.createdAt) as month, COUNT(b) as count FROM Boost b GROUP BY MONTH(b.createdAt) ORDER BY MONTH(b.createdAt)")
    List<Object[]> getMonthlyBoostStats();}
