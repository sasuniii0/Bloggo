package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.repository.DashboardRepository;
import lk.ijse.gdse.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final DashboardRepository dashboardRepository;
    @Override
    public List<Post> serachByKeyword(String keyword) {
        return dashboardRepository.findByKeyword(keyword);
    }
}
