package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.WalletDTO;
import lk.ijse.gdse.entity.Earning;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.Wallet;

import java.util.List;

public interface WalletService {
    List<Earning> getWalletEarnings(Long walletId);
    Wallet getWalletByUserId(Long userId);
    List<WalletDTO> getWalletBalanceByUserId(Long userId);

    List<WalletDTO> getAllMembersByRole(RoleName roleName);
}
