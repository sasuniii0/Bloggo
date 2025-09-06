package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.Earning;
import lk.ijse.gdse.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class WalletController {
    private final WalletService walletService;

    @GetMapping("/{walletId}/earnings")
    public ResponseEntity<ApiResponseDTO> getEarnings(@PathVariable Long walletId) {
        List<Earning> earnings = walletService.getWalletEarnings(walletId);
        return ResponseEntity.ok(ApiResponseDTO.builder()
                .status(200)
                .message("Earnings fetched successfully")
                .data(earnings)
                .build());
    }
}
