package lk.ijse.gdse.repository;

import lk.ijse.gdse.dto.FollowDTO;
import lk.ijse.gdse.entity.Follow;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndFollowed(User follower, User followed);
    Long countByFollowed(User followed);


    @Query("SELECT new lk.ijse.gdse.dto.FollowDTO(f.followId, f.follower.userId, f.followed.userId) " +
            "FROM Follow f WHERE f.follower.userId = :userId")
    List<FollowDTO> getFollowsByFollowerId(@Param("userId") Long userId);

    // Get all users followed by a specific user
    @Query("SELECT f.followed FROM Follow f WHERE f.follower.userId = :userId")
    List<User> findFollowingByUserId(@Param("userId") Long userId);

    // Get all followers of a specific user
    @Query("SELECT f.follower FROM Follow f WHERE f.followed.userId = :userId")
    List<User> findFollowersByUserId(@Param("userId") Long userId);


}
