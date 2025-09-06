package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Earning;
import lk.ijse.gdse.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EarningRepository extends JpaRepository<Earning, Long> {
    List<Earning> findByWalletIdOrderByCreatedAtDesc(Wallet wallet);
}
