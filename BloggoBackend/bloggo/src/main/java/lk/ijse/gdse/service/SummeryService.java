package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.SummeryRequestDTO;
import lk.ijse.gdse.dto.SummeryResponseDTO;

public interface SummeryService {
    SummeryResponseDTO summarize(SummeryRequestDTO request);
/*
    String generateSummary(String text);
*/
}
