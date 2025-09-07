package lk.ijse.gdse.controller;

import com.paypal.api.payments.Links;
import com.paypal.base.rest.PayPalRESTException;
import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PaymentReqDTO;
import lk.ijse.gdse.entity.Payment;
import lk.ijse.gdse.entity.PaymentStatus;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.PaymentService;
import lk.ijse.gdse.service.PaypalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/pay")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class PaymentController {
    private final PaymentService paymentService;
    private final PaypalService paypalService;

    /*@PostMapping("/pay")
    public ResponseEntity<ApiResponseDTO> pay(@RequestBody PaymentReqDTO request) throws PayPalRESTException {
        String cancelUrl = "http://localhost:8080/api/v1/payments/cancel";
        String successUrl = "http://localhost:8080/api/v1/payments/success";

        com.paypal.api.payments.Payment paypalPayment = paypalService.createPayment(
                request.getAmount(),
                request.getCurrency(),
                "paypal",
                "sale",
                "Membership upgrade",
                cancelUrl,
                successUrl
        );

        for (Links link : paypalPayment.getLinks()) {
            if ("approval_url".equals(link.getRel())) {
                return ResponseEntity.ok(
                        new ApiResponseDTO(200, "Redirect to PayPal", link.getHref())
                );
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseDTO(400, "No approval link found", null));

    }


    @GetMapping("/success")
    public ResponseEntity<ApiResponseDTO> success(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId,
            @RequestParam("userId") Long userId) {

        try {
            // Execute payment on PayPal
            com.paypal.api.payments.Payment paypalPayment = paypalService.executePayment(paymentId, payerId);

            // Save payment in DB as entity
            Payment paymentEntity = Payment.builder()
                    .user(User.builder().userId(userId).build())
                    .amount(Double.parseDouble(paypalPayment.getTransactions().get(0).getAmount().getTotal()))
                    .currency(paypalPayment.getTransactions().get(0).getAmount().getCurrency())
                    .paymentMethod("PayPal")
                    .status(PaymentStatus.SUCCESS)
                    .transactionId(Long.valueOf(paypalPayment.getId())) // store as string
                    .createdAt(LocalDateTime.now())
                    .build();

            Payment savedPayment = paymentService.savePayment(paymentEntity);

            return ResponseEntity.ok(
                    new ApiResponseDTO(200, "Payment completed successfully", savedPayment)
            );

        } catch (PayPalRESTException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponseDTO(400, "Payment execution failed", e.getMessage()));
        }
    }


    @GetMapping("/cancel")
    public ResponseEntity<ApiResponseDTO> cancel() {
        return ResponseEntity.ok(new ApiResponseDTO(500, "Payment cancelled", null));
    }*/
}
