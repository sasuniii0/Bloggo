package lk.ijse.gdse.repository;

import lk.ijse.gdse.dto.WalletDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Wallet findByUserId(User userId);

    Wallet findByUserId_UserId(Long userId);

    boolean existsByUserId(User userSaved);

    Wallet getWalletByUserId(User userId);

    List<WalletDTO> findWalletByUserId_UserId(Long userIdUserId);


    @Query(value = "SELECT w.wallet_id AS id, w.balance, w.user_id AS userId " +
            "FROM wallet w WHERE w.user_id = :userId",
            nativeQuery = true)
    List<WalletDTO> findWalletByUserId(@Param("userId") Long userId);




}
