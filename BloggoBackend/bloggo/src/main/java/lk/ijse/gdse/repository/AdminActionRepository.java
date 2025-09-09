package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.AdminAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface AdminActionRepository extends JpaRepository<AdminAction, Long> {
    Optional<AdminAction> findTopByTargetUser_UserIdOrderByCreatedAtDesc(Long userId);
}
