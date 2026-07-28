package com.company.ecommerce.service.impl;

import com.company.ecommerce.entity.AuditLog;
import com.company.ecommerce.repository.AuditLogRepository;
import com.company.ecommerce.service.AuditLogService;
import com.company.ecommerce.util.LogMaskingUtils;
import com.company.ecommerce.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Override
    public void logEvent(String email, String eventType, String description, String status, HttpServletRequest request) {
        try {
            String clientIp = request != null ? SecurityUtils.getClientIp(request) : "N/A";
            String userAgent = request != null ? SecurityUtils.getUserAgent(request) : "N/A";

            AuditLog auditLog = AuditLog.builder()
                    .userEmail(email)
                    .eventType(eventType)
                    .description(description)
                    .ipAddress(clientIp)
                    .userAgent(userAgent)
                    .status(status)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit Event Logged: Event={}, Email={}, Status={}", 
                    eventType, LogMaskingUtils.maskEmail(email), status);
        } catch (Exception ex) {
            log.error("Failed to record audit log event for email {}", LogMaskingUtils.maskEmail(email), ex);
        }
    }
}
