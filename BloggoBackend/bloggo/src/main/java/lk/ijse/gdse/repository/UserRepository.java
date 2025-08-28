package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findUserByEmailOrUsername(String email, String username);

    User getUserByUserId(Long userId);


    @Query("SELECT u.username FROM User u")
    List<String> getAllUsernames();

    List<User> findUserByRole(RoleName role);

    Optional<User> findByEmail(String email);

    Optional<User> findByResetToken(String token);
}
