package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Follow;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existByFollowerAndFollower(User user1, User user2);
    Long countByFollowed(User followed);
}
