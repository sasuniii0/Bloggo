package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Wallet findByUserId(User userId);
    Optional<Wallet> findByUserId_UserId(Long userId);
}
