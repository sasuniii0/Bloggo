package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.BroadcastDTO;

import java.io.IOException;

public interface BroadcastService {
    void sendBroadcast(BroadcastDTO dto) throws IOException;
}
