package lk.ijse.gdse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.Map;

@Controller
@CrossOrigin(origins = "http://localhost:63342",allowCredentials = "true")
@RequestMapping("/api/v1/payments")
public class PayHereIntController {
    private static final String MERCHANT_ID = "";
    private static final String MERCHANT_SECRET = "";

    @PostMapping("/generate-hash")
    public ResponseEntity<String> generateHash(
            @RequestParam String orderId,
            @RequestParam double amount,
            @RequestParam String currency
    ) throws Exception {
        String formattedAmount = String.format("%.2f", amount);

        String localHash = generateMd5(
                MERCHANT_ID + orderId + formattedAmount + currency + generateMd5(MERCHANT_SECRET).toUpperCase()
        ).toUpperCase();

        return ResponseEntity.ok(localHash);
    }

    private String generateMd5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] messageDigest = md.digest(input.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : messageDigest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @PostMapping("/notify")
    public ResponseEntity<String> paymentNotify(@RequestParam Map<String, String> params) throws Exception {
        String merchantId = params.get("merchant_id");
        String orderId = params.get("order_id");
        String amount = params.get("payhere_amount");
        String currency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String receivedSig = params.get("md5sig");

        String localSig = generateMd5(
                merchantId + orderId + amount + currency + statusCode + generateMd5(MERCHANT_SECRET).toUpperCase()
        ).toUpperCase();

        if (!localSig.equals(receivedSig)) {
            return ResponseEntity.badRequest().body("Invalid Signature!");
        }

        if ("2".equals(statusCode)) {
            System.out.println("Payment success: " + orderId);
        } else {
            System.out.println("Payment failed: " + orderId);
        }

        return ResponseEntity.ok("Notification Received");
    }

    @GetMapping("/success")
    public ResponseEntity<String> paymentSuccess() {
        return ResponseEntity.ok("Payment Success! You can show a nice success page here.");
    }

    @GetMapping("/cancel")
    public ResponseEntity<String> paymentCancel() {
        return ResponseEntity.ok("Payment Cancelled! Show cancellation page here.");
    }

}
