package com.company.ecommerce.service;

import jakarta.servlet.http.HttpServletRequest;

public interface AuditLogService {

    void logEvent(String email, String eventType, String description, String status, HttpServletRequest request);
}
