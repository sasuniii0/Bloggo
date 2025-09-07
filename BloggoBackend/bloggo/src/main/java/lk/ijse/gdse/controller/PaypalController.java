package lk.ijse.gdse.controller;

import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import lk.ijse.gdse.service.PaypalService;
import lk.ijse.gdse.service.impl.PaypalServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")

public class PaypalController {
    private final PaypalServiceImpl paypalService;

    @GetMapping("/")
    public String home() {
        return "redirect:http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/payment.html";
    }

    @PostMapping("/payment/create")
    public RedirectView createPayment(
            @RequestParam("method")String method,
            @RequestParam("amount")Double amount,
            @RequestParam("currency")String currency,
            @RequestParam("description")String description
    ){
        try{
            String cancelUrl = "http://localhost:8080/api/v1/payment/cancel";
            String successUrl = "http://localhost:8080/api/v1/payment/success";

            Payment payment = paypalService.createPayment(
                    Double.valueOf(amount),
                    currency,
                    method,
                    "sale",
                    description,
                    cancelUrl,
                    successUrl
            );

            for (Links links : payment.getLinks()) {
                if (links.getRel().equals("approval_url")) {
                    return new RedirectView(links.getHref());
                }
            }
        }catch (PayPalRESTException e){
            log.error("Error occurred while creating PayPal payment: {}", e.getMessage());
            return new RedirectView("/error");
        }
        return new RedirectView("/payment/error");

    }

    @GetMapping("/payment/success")
    public String paymentSuccess(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("payerID") String payerId
    ){
        try{
            Payment payment = paypalService.executePayment(paymentId, payerId);
            if (payment.getState().equals("approved")) {
                return  "redirect:http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/paymentSuccess.html";
            }
        }catch (PayPalRESTException e){
            log.error("Error occurred while executing PayPal payment: {}", e.getMessage());
        }
        return "redirect:http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/paymentCancel.html";
    }

    @GetMapping("/payment/cancel")
    public String paymentCancel(){
        return "redirect:http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/paymentCancel.html";
    }

    @GetMapping("/payment/error")
    public String paymentError(){
        return "redirect:http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/paymentError.html";
    }
}
