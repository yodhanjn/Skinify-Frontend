package com.company.ecommerce.service.impl;

import com.company.ecommerce.dto.request.*;
import com.company.ecommerce.dto.response.AuthResponse;
import com.company.ecommerce.dto.response.UserResponse;
import com.company.ecommerce.entity.*;
import com.company.ecommerce.exception.*;
import com.company.ecommerce.mapper.UserMapper;
import com.company.ecommerce.repository.*;
import com.company.ecommerce.security.BruteForceProtectionService;
import com.company.ecommerce.security.JwtTokenProvider;
import com.company.ecommerce.security.UserPrincipal;
import com.company.ecommerce.service.AuditLogService;
import com.company.ecommerce.service.AuthService;
import com.company.ecommerce.service.EmailService;
import com.company.ecommerce.util.LogMaskingUtils;
import com.company.ecommerce.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Value("${app.security.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Value("${app.security.jwt.reset-token-expiration-ms:900000}")
    private long resetTokenExpirationMs;

    @Value("${app.security.jwt.verification-token-expiration-ms:86400000}")
    private long verificationTokenExpirationMs;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final BruteForceProtectionService bruteForceProtectionService;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest registerRequest, HttpServletRequest request) {
        log.info("Processing user registration for email: {}", LogMaskingUtils.maskEmail(registerRequest.getEmail()));

        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new InvalidCredentialsException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("An account with email " + registerRequest.getEmail() + " already exists");
        }

        if (userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
            throw new UserAlreadyExistsException("An account with phone number " + registerRequest.getPhoneNumber() + " already exists");
        }

        User user = userMapper.toUser(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setIsEnabled(false); // Email verification required
        user.setIsAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setLegacyRole("CUSTOMER");

        // Assign ROLE_USER
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_USER)
                        .description("Standard User / Customer Role")
                        .build()));

        user.setRoles(Set.of(userRole));
        User savedUser = userRepository.save(user);

        // Generate email verification token
        String verificationToken = UUID.randomUUID().toString();
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .token(verificationToken)
                .user(savedUser)
                .expiryDate(Instant.now().plusMillis(verificationTokenExpirationMs))
                .used(false)
                .build();
        emailVerificationTokenRepository.save(evt);

        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getFirstName(), verificationToken);

        // Log audit event
        auditLogService.logEvent(savedUser.getEmail(), "USER_REGISTRATION", "User registered successfully", "SUCCESS", request);

        return userMapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest loginRequest, HttpServletRequest request) {
        log.info("Attempting login for email: {}", LogMaskingUtils.maskEmail(loginRequest.getEmail()));

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    recordLoginAttempt(loginRequest.getEmail(), false, "User not found", request);
                    return new InvalidCredentialsException("Invalid email or password");
                });

        // Check unlock status
        if (!bruteForceProtectionService.checkUnlockTime(user)) {
            recordLoginAttempt(user.getEmail(), false, "Account locked", request);
            throw new LockedException("Your account is locked due to repeated failed login attempts. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Check email verification status
            if (!Boolean.TRUE.equals(user.getIsEnabled())) {
                recordLoginAttempt(user.getEmail(), false, "Email not verified", request);
                throw new DisabledException("Your account is not verified. Please check your email for the verification link.");
            }

            // Reset failed login attempts on successful login
            bruteForceProtectionService.resetFailedLoginAttempts(user);

            // Generate Access Token & Refresh Token
            String accessToken = tokenProvider.generateAccessToken(authentication);
            RefreshToken refreshToken = createRefreshToken(user, request);

            recordLoginAttempt(user.getEmail(), true, "Login successful", request);
            auditLogService.logEvent(user.getEmail(), "USER_LOGIN", "User logged in successfully", "SUCCESS", request);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .tokenType("Bearer")
                    .expiresInMs(tokenProvider.getExpirationMs())
                    .user(userMapper.toUserResponse(user))
                    .build();

        } catch (Exception ex) {
            bruteForceProtectionService.recordFailedLogin(user);
            recordLoginAttempt(user.getEmail(), false, ex.getMessage(), request);
            auditLogService.logEvent(user.getEmail(), "USER_LOGIN", "Failed login attempt: " + ex.getMessage(), "FAILED", request);
            throw ex;
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest, HttpServletRequest request) {
        String tokenStr = refreshTokenRequest.getRefreshToken();
        log.info("Processing refresh token request");

        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new TokenException("Refresh token not found in database"));

        if (Boolean.TRUE.equals(refreshToken.getRevoked())) {
            auditLogService.logEvent(refreshToken.getUser().getEmail(), "REFRESH_TOKEN", "Attempted use of revoked refresh token", "SECURITY_ALERT", request);
            throw new TokenException("Refresh token was revoked. Please log in again.");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new TokenException("Refresh token has expired. Please log in again.");
        }

        User user = refreshToken.getUser();

        // Token Rotation: Revoke old token and issue new token pair
        refreshToken.setRevoked(true);
        String newRefreshTokenStr = UUID.randomUUID().toString();
        refreshToken.setReplacedByToken(newRefreshTokenStr);
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .token(newRefreshTokenStr)
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .userAgent(SecurityUtils.getUserAgent(request))
                .ipAddress(SecurityUtils.getClientIp(request))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        String roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.joining(","));

        String newAccessToken = tokenProvider.generateTokenFromEmail(user.getEmail(), roles, user.getUserId());
        auditLogService.logEvent(user.getEmail(), "REFRESH_TOKEN", "Token refreshed successfully", "SUCCESS", request);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .tokenType("Bearer")
                .expiresInMs(tokenProvider.getExpirationMs())
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshTokenStr, boolean allDevices, HttpServletRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUserPrincipal()
                .orElseThrow(() -> new InvalidCredentialsException("No authenticated user found"));

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (allDevices) {
            List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);
            activeTokens.forEach(t -> t.setRevoked(true));
            refreshTokenRepository.saveAll(activeTokens);
            auditLogService.logEvent(user.getEmail(), "USER_LOGOUT", "Logged out from all devices", "SUCCESS", request);
        } else if (refreshTokenStr != null) {
            refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(t -> {
                t.setRevoked(true);
                refreshTokenRepository.save(t);
            });
            auditLogService.logEvent(user.getEmail(), "USER_LOGOUT", "Logged out from current device", "SUCCESS", request);
        }

        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional
    public void verifyEmail(String token, HttpServletRequest request) {
        EmailVerificationToken evt = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenException("Invalid email verification token"));

        if (Boolean.TRUE.equals(evt.getUsed())) {
            throw new TokenException("Verification token has already been used");
        }

        if (evt.getExpiryDate().isBefore(Instant.now())) {
            throw new TokenException("Verification token has expired");
        }

        User user = evt.getUser();
        user.setIsEnabled(true);
        userRepository.save(user);

        evt.setUsed(true);
        emailVerificationTokenRepository.save(evt);

        auditLogService.logEvent(user.getEmail(), "EMAIL_VERIFICATION", "Email verified successfully", "SUCCESS", request);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(ResendVerificationEmailRequest resendRequest, HttpServletRequest request) {
        User user = userRepository.findByEmail(resendRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + resendRequest.getEmail()));

        if (Boolean.TRUE.equals(user.getIsEnabled())) {
            throw new TokenException("Account is already verified");
        }

        // Delete existing verification tokens for user
        emailVerificationTokenRepository.deleteByUser(user);

        String newToken = UUID.randomUUID().toString();
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .token(newToken)
                .user(user)
                .expiryDate(Instant.now().plusMillis(verificationTokenExpirationMs))
                .used(false)
                .build();
        emailVerificationTokenRepository.save(evt);

        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), newToken);
        auditLogService.logEvent(user.getEmail(), "RESEND_VERIFICATION", "Resent verification email", "SUCCESS", request);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest forgotPasswordRequest, HttpServletRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(forgotPasswordRequest.getEmail());
        if (userOptional.isEmpty()) {
            // Do not leak whether email exists
            return;
        }

        User user = userOptional.get();
        passwordResetTokenRepository.deleteByUser(user);

        String plainToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(plainToken);

        PasswordResetToken prt = PasswordResetToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .expiryDate(Instant.now().plusMillis(resetTokenExpirationMs))
                .used(false)
                .build();

        passwordResetTokenRepository.save(prt);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), plainToken);

        auditLogService.logEvent(user.getEmail(), "FORGOT_PASSWORD", "Initiated password reset request", "SUCCESS", request);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest resetPasswordRequest, HttpServletRequest request) {
        if (!resetPasswordRequest.getNewPassword().equals(resetPasswordRequest.getConfirmPassword())) {
            throw new InvalidCredentialsException("New password and confirm password do not match");
        }

        String tokenHash = hashToken(resetPasswordRequest.getToken());
        PasswordResetToken prt = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new TokenException("Invalid or expired password reset token"));

        if (Boolean.TRUE.equals(prt.getUsed())) {
            throw new TokenException("Password reset token has already been used");
        }

        if (prt.getExpiryDate().isBefore(Instant.now())) {
            throw new TokenException("Password reset token has expired");
        }

        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        userRepository.save(user);

        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);

        // Revoke all existing refresh tokens for security
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);
        activeTokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(activeTokens);

        auditLogService.logEvent(user.getEmail(), "RESET_PASSWORD", "Password reset successfully", "SUCCESS", request);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest changePasswordRequest, HttpServletRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUserPrincipal()
                .orElseThrow(() -> new InvalidCredentialsException("No authenticated user found"));

        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmNewPassword())) {
            throw new InvalidCredentialsException("New password and confirm new password do not match");
        }

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(changePasswordRequest.getNewPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);

        auditLogService.logEvent(user.getEmail(), "CHANGE_PASSWORD", "Password changed successfully", "SUCCESS", request);
    }

    private RefreshToken createRefreshToken(User user, HttpServletRequest request) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .userAgent(SecurityUtils.getUserAgent(request))
                .ipAddress(SecurityUtils.getClientIp(request))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private void recordLoginAttempt(String email, boolean success, String reason, HttpServletRequest request) {
        LoginAttempt attempt = LoginAttempt.builder()
                .email(email)
                .ipAddress(request != null ? SecurityUtils.getClientIp(request) : "N/A")
                .success(success)
                .failureReason(reason)
                .build();
        loginAttemptRepository.save(attempt);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
