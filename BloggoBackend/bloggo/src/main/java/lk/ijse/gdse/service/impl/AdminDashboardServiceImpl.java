package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.repository.BoostRepository;
import lk.ijse.gdse.repository.CommentRepository;
import lk.ijse.gdse.repository.PostRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final BoostRepository boostRepository;

    @Override
    public Map<String, Object> getUserStats() {
        List<Object[]> stats = userRepository.getMonthlyUserStats();
        return buildStatMap(stats);
    }

    @Override
    public Map<String, Object> getPostStats() {
        List<Object[]> stats = postRepository.getMonthlyPostStats();
        return buildStatMap(stats);
    }

    @Override
    public Map<String, Object> getBoostStats() {
        List<Object[]> stats = boostRepository.getMonthlyBoostStats();
        return buildStatMap(stats);
    }

    @Override
    public Map<String, Object> getCommentStats() {
        List<Object[]> stats = commentRepository.getMonthlyCommentStats();
        return buildStatMap(stats);
    }

    private Map<String, Object> buildStatMap(List<Object[]> stats) {
        Map<String, Object> map = new HashMap<>();
        List<String> months = new ArrayList<>();
        List<Long> counts = new ArrayList<>();
        long total = 0;

        for (Object[] row : stats) {
            if (row == null || row[0] == null || row[1] == null) {
                // Skip rows with null values
                continue;
            }

            int monthIndex;
            long count;

            // Handle potential type casting issues
            try {
                monthIndex = ((Number) row[0]).intValue() - 1; // MONTH() returns 1-12
                count = ((Number) row[1]).longValue();
            } catch (ClassCastException e) {
                // Skip row if types are unexpected
                continue;
            }

            total += count;
            months.add(getMonthName(monthIndex));
            counts.add(count);
        }

        // Optional: provide empty data if no stats found
        if (months.isEmpty()) {
            months = Arrays.asList("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
            counts = Collections.nCopies(12, 0L);
        }

        map.put("months", months);
        map.put("counts", counts);
        map.put("total", total);
        return map;
    }


    private String getMonthName(int monthIndex) {
        return new java.text.DateFormatSymbols().getShortMonths()[monthIndex];
    }
}
