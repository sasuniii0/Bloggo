package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.Earning;

import java.util.List;

public interface WalletService {
    List<Earning> getWalletEarnings(Long walletId);
}
