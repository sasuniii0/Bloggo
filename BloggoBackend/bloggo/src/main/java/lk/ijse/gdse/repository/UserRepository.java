package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByResetToken(String token);

    User getUserByUserId(Long userId);

    // Pagination + role filter
    Page<User> findByRole(String role, Pageable pageable);

    @Query("SELECT u.username FROM User u")
    List<String> getAllUsernames();

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findUserByRole(RoleName roleName);

    List<User> findTop5ByRoleOrderByCreatedAtDesc(RoleName roleName);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY u.createdAt DESC")
    List<User> searchUsersByKeyword(@Param("keyword") String keyword);
}
