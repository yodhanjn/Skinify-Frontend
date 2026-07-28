package com.company.ecommerce.service;

import com.company.ecommerce.dto.request.*;
import com.company.ecommerce.dto.response.AuthResponse;
import com.company.ecommerce.dto.response.UserResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    UserResponse register(RegisterRequest registerRequest, HttpServletRequest request);

    AuthResponse login(LoginRequest loginRequest, HttpServletRequest request);

    AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest, HttpServletRequest request);

    void logout(String refreshToken, boolean allDevices, HttpServletRequest request);

    void verifyEmail(String token, HttpServletRequest request);

    void resendVerificationEmail(ResendVerificationEmailRequest resendRequest, HttpServletRequest request);

    void forgotPassword(ForgotPasswordRequest forgotPasswordRequest, HttpServletRequest request);

    void resetPassword(ResetPasswordRequest resetPasswordRequest, HttpServletRequest request);

    void changePassword(ChangePasswordRequest changePasswordRequest, HttpServletRequest request);
}
