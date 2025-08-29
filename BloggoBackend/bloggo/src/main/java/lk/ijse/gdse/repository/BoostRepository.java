package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Boost;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoostRepository extends JpaRepository<Boost, Long> {
    boolean existByUserAndPost(User user, Post post);
    Long countByPost(Post post);
    Optional<Boost> findByUserAndPost(User user, Post post);
}
