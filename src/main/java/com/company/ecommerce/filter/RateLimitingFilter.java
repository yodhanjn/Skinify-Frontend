package com.company.ecommerce.filter;

import com.company.ecommerce.dto.response.ApiResponse;
import com.company.ecommerce.util.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${app.security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.security.rate-limit.requests-per-minute:10}")
    private int maxRequestsPerMinute;

    private final Map<String, Queue<Long>> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!rateLimitEnabled || !isRateLimitedEndpoint(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = SecurityUtils.getClientIp(request);
        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - 60000; // 1 minute window

        requestCounts.putIfAbsent(clientIp, new ConcurrentLinkedQueue<>());
        Queue<Long> timestamps = requestCounts.get(clientIp);

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peek() < windowStart) {
                timestamps.poll();
            }

            if (timestamps.size() >= maxRequestsPerMinute) {
                log.warn("Rate limit exceeded for IP: {} on URI: {}", clientIp, request.getRequestURI());

                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setStatus(429); // 429 Too Many Requests

                ApiResponse<Void> apiResponse = ApiResponse.error(
                        "Rate limit exceeded. Maximum " + maxRequestsPerMinute + " requests per minute allowed.",
                        "RATE_LIMIT_EXCEEDED",
                        request.getRequestURI()
                );

                objectMapper.writeValue(response.getOutputStream(), apiResponse);
                return;
            }

            timestamps.add(currentTime);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedEndpoint(String uri) {
        return uri.contains("/auth/login")
                || uri.contains("/auth/register")
                || uri.contains("/auth/forgot-password")
                || uri.contains("/auth/resend-verification");
    }
}
