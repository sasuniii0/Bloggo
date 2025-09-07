package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Payment;
import lk.ijse.gdse.repository.PaymentRepository;
import lk.ijse.gdse.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    @Override
    public Payment savePayment(Payment payment) {
        payment.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }


}
