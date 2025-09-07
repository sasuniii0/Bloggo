package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.Earning;
import lk.ijse.gdse.entity.Wallet;

import java.util.List;
import java.util.Optional;

public interface WalletService {
    List<Earning> getWalletEarnings(Long walletId);
    Optional<Wallet> getWalletByUserId(Long userId);

}
