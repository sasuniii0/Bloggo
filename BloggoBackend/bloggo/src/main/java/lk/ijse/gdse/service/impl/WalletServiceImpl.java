package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.WalletDTO;
import lk.ijse.gdse.entity.Earning;
import lk.ijse.gdse.entity.Wallet;
import lk.ijse.gdse.exception.ResourceNotFoundException;
import lk.ijse.gdse.repository.EarningRepository;
import lk.ijse.gdse.repository.WalletRepository;
import lk.ijse.gdse.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        return earningRepository.findByWalletIdOrderByCreatedAtDesc(wallet);    }

    @Override
    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId_UserId(userId);
    }

    @Override
    public List<WalletDTO> getWalletBalanceByUserId(Long userId) {
        return walletRepository.findWalletByUserId(userId);
    }



}
