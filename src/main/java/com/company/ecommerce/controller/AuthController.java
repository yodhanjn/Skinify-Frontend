package com.company.ecommerce.controller;

import com.company.ecommerce.dto.request.*;
import com.company.ecommerce.dto.response.ApiResponse;
import com.company.ecommerce.dto.response.AuthResponse;
import com.company.ecommerce.dto.response.UserResponse;
import com.company.ecommerce.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Authorization API", description = "Endpoints for user registration, authentication, token management, password resets, and email verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Creates a new user account with BCrypt encrypted password and sends email verification link")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {
        UserResponse response = authService.register(registerRequest, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully. Please check your email to verify your account.", response, request.getRequestURI()));
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user credentials and returns JWT Access Token and Refresh Token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        AuthResponse response = authService.login(loginRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response, request.getRequestURI()));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh JWT Access Token", description = "Issues a new JWT Access Token and rotated Refresh Token using a valid Refresh Token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest,
            HttpServletRequest request) {
        AuthResponse response = authService.refreshToken(refreshTokenRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response, request.getRequestURI()));
    }

    @PostMapping("/logout")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Logout user", description = "Revokes refresh tokens for current device or all devices")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestParam(value = "refreshToken", required = false) String refreshToken,
            @RequestParam(value = "allDevices", defaultValue = "false") boolean allDevices,
            HttpServletRequest request) {
        authService.logout(refreshToken, allDevices, request);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", request.getRequestURI()));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify user email address", description = "Validates verification token sent via email and activates the user account")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam("token") String token,
            HttpServletRequest request) {
        authService.verifyEmail(token, request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now log in.", request.getRequestURI()));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification link", description = "Dispatches a new email verification token (rate-limited)")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(
            @Valid @RequestBody ResendVerificationEmailRequest resendRequest,
            HttpServletRequest request) {
        authService.resendVerificationEmail(resendRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Verification email has been resent. Please check your inbox.", request.getRequestURI()));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset link", description = "Sends a 15-minute password reset link to user email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest,
            HttpServletRequest request) {
        authService.forgotPassword(forgotPasswordRequest, request);
        return ResponseEntity.ok(ApiResponse.success("If an account exists for this email, a password reset link has been sent.", request.getRequestURI()));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token", description = "Resets user password using the token received in email")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest resetPasswordRequest,
            HttpServletRequest request) {
        authService.resetPassword(resetPasswordRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. Please log in with your new password.", request.getRequestURI()));
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Change password for authenticated user", description = "Allows logged in users to change their account password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            HttpServletRequest request) {
        authService.changePassword(changePasswordRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", request.getRequestURI()));
    }
}
