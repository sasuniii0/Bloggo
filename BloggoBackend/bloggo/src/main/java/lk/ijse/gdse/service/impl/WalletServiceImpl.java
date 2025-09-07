package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Earning;
import lk.ijse.gdse.entity.Wallet;
import lk.ijse.gdse.repository.EarningRepository;
import lk.ijse.gdse.repository.WalletRepository;
import lk.ijse.gdse.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {
    private final WalletRepository walletRepository;
    private final EarningRepository earningRepository;

    @Override
    public List<Earning> getWalletEarnings(Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return earningRepository.findByWalletIdOrderByCreatedAtDesc(wallet);    }

    @Override
    public Optional<Wallet> getWalletByUserId(Long userId) {
        return walletRepository.findByUserId_UserId(userId);
    }
}
