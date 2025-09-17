package lk.ijse.gdse.repository;

import lk.ijse.gdse.dto.PaginationDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("SELECT u FROM User u WHERE u.role = :roleName ORDER BY u.createdAt DESC")
    List<User> findUserByRole(@Param("roleName") RoleName roleName);


    List<User> findTop5ByRoleOrderByCreatedAtDesc(RoleName roleName);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY u.createdAt DESC")
    List<User> searchUsersByKeyword(@Param("keyword") String keyword);

    @Query("""
    SELECT new lk.ijse.gdse.dto.PaginationDTO(
        u.userId,
        u.username,
        u.email,
        u.role,
        (SELECT a FROM AdminAction a WHERE a.targetUser = u ORDER BY a.createdAt DESC LIMIT 1)
    )
    FROM User u
    ORDER BY u.createdAt DESC
""")
    Page<PaginationDTO> findUsersWithLatestAction(Pageable pageable);


    @Modifying
    @Query(
            value = "UPDATE user u SET u.status = CASE WHEN u.status = 'ACTIVE' THEN 'INACTIVE' WHEN u.status = 'INACTIVE' THEN 'ACTIVE' ELSE u.status END WHERE u.user_id = :userId",
            nativeQuery = true
    )
    int toggleUserStatus(@Param("userId") Long userId);

    @Query("SELECT MONTH(u.createdAt) as month, COUNT(u) as count FROM User u GROUP BY MONTH(u.createdAt) ORDER BY MONTH(u.createdAt)")
    List<Object[]> getMonthlyUserStats();

    List<User> findByRoleNotAndUserIdNotOrderByCreatedAtDesc(RoleName role, Long userId);

    List<User> findByRoleNotAndUserIdNotInOrderByCreatedAtDesc(RoleName roleName, List<Long> loggedUserId);
}
