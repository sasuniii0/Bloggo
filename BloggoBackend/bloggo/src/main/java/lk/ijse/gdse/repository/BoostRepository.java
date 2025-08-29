package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Boost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoostRepository extends JpaRepository<Boost, Long> {
}
