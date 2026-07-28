package com.company.ecommerce.service.impl;

import com.company.ecommerce.service.EmailService;
import com.company.ecommerce.util.LogMaskingUtils;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmtpEmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@skinify.com}")
    private String fromEmail;

    @Async
    @Override
    public void sendVerificationEmail(String toEmail, String name, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Skinify - Verify Your Email Address";

        String content = "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;'>"
                + "<h2 style='color: #4F46E5;'>Welcome to Skinify, " + name + "!</h2>"
                + "<p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + verificationUrl + "' style='background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Verify Email Address</a>"
                + "</div>"
                + "<p style='color: #666;'>This link will expire in 24 hours.</p>"
                + "<p style='color: #999; font-size: 12px;'>If you did not create an account on Skinify, please ignore this email.</p>"
                + "</div>";

        sendHtmlMessage(toEmail, subject, content);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String toEmail, String name, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Skinify - Password Reset Request";

        String content = "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;'>"
                + "<h2 style='color: #EF4444;'>Password Reset Request</h2>"
                + "<p>Hello " + name + ",</p>"
                + "<p>We received a request to reset your Skinify account password. Click the button below to choose a new password:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + resetUrl + "' style='background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Reset Password</a>"
                + "</div>"
                + "<p style='color: #666;'>This link will expire in 15 minutes and can only be used once.</p>"
                + "<p style='color: #999; font-size: 12px;'>If you did not request a password reset, please secure your account immediately.</p>"
                + "</div>";

        sendHtmlMessage(toEmail, subject, content);
    }

    private void sendHtmlMessage(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to {}", LogMaskingUtils.maskEmail(toEmail));
        } catch (Exception ex) {
            log.warn("Could not dispatch email to {} via SMTP (Local dev fallback). Subject: {}. Exception: {}", 
                    LogMaskingUtils.maskEmail(toEmail), subject, ex.getMessage());
        }
    }
}
