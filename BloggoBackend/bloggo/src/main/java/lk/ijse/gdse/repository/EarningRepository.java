package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Earning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EarningRepository extends JpaRepository<Earning, Long> {
}
