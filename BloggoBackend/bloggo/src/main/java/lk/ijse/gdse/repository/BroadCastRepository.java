package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.BroadcastMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BroadCastRepository extends JpaRepository<BroadcastMessage, Long> {
}
