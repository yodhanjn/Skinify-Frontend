package com.company.ecommerce.service;

import com.company.ecommerce.dto.request.LoginRequest;
import com.company.ecommerce.dto.request.RegisterRequest;
import com.company.ecommerce.dto.response.AuthResponse;
import com.company.ecommerce.dto.response.UserResponse;
import com.company.ecommerce.entity.RefreshToken;
import com.company.ecommerce.entity.Role;
import com.company.ecommerce.entity.RoleName;
import com.company.ecommerce.entity.User;
import com.company.ecommerce.exception.InvalidCredentialsException;
import com.company.ecommerce.exception.UserAlreadyExistsException;
import com.company.ecommerce.mapper.UserMapper;
import com.company.ecommerce.repository.*;
import com.company.ecommerce.security.BruteForceProtectionService;
import com.company.ecommerce.security.JwtTokenProvider;
import com.company.ecommerce.security.UserPrincipal;
import com.company.ecommerce.service.impl.AuthServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock
    private LoginAttemptRepository loginAttemptRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private UserMapper userMapper;
    @Mock
    private EmailService emailService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private BruteForceProtectionService bruteForceProtectionService;
    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        Role userRole = Role.builder().roleId(1).name(RoleName.ROLE_USER).build();

        sampleUser = User.builder()
                .userId(1)
                .username("jane.doe@example.com")
                .email("jane.doe@example.com")
                .password("encoded_pass")
                .firstName("Jane")
                .lastName("Doe")
                .phoneNumber("+1234567890")
                .roles(Set.of(userRole))
                .isEnabled(true)
                .isAccountNonLocked(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane.doe@example.com")
                .phoneNumber("+1234567890")
                .password("ValidP@ssword123")
                .confirmPassword("ValidP@ssword123")
                .build();

        loginRequest = LoginRequest.builder()
                .email("jane.doe@example.com")
                .password("ValidP@ssword123")
                .build();
    }

    @Test
    @DisplayName("Should successfully register new user")
    void shouldRegisterUserSuccessfully() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(userMapper.toUser(any(RegisterRequest.class))).thenReturn(sampleUser);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_pass");
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(Role.builder().name(RoleName.ROLE_USER).build()));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(userMapper.toUserResponse(any(User.class))).thenReturn(UserResponse.builder().email("jane.doe@example.com").build());

        UserResponse response = authService.register(registerRequest, request);

        assertNotNull(response);
        assertEquals("jane.doe@example.com", response.getEmail());
        verify(emailService, times(1)).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate email")
    void shouldThrowExceptionWhenDuplicateEmail() {
        when(userRepository.existsByEmail("jane.doe@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(registerRequest, request));
    }

    @Test
    @DisplayName("Should throw exception when password and confirm password mismatch")
    void shouldThrowExceptionWhenPasswordMismatch() {
        registerRequest.setConfirmPassword("Mismatch123!");
        assertThrows(InvalidCredentialsException.class, () -> authService.register(registerRequest, request));
    }

    @Test
    @DisplayName("Should successfully authenticate valid user login")
    void shouldLoginSuccessfully() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(sampleUser));
        when(bruteForceProtectionService.checkUnlockTime(sampleUser)).thenReturn(true);
        
        UserPrincipal userPrincipal = UserPrincipal.create(sampleUser);
        Authentication auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        
        when(tokenProvider.generateAccessToken(auth)).thenReturn("jwt_access_token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(RefreshToken.builder().token(UUID.randomUUID().toString()).build());
        when(userMapper.toUserResponse(sampleUser)).thenReturn(UserResponse.builder().email(sampleUser.getEmail()).build());

        AuthResponse response = authService.login(loginRequest, request);

        assertNotNull(response);
        assertEquals("jwt_access_token", response.getAccessToken());
        verify(bruteForceProtectionService, times(1)).resetFailedLoginAttempts(sampleUser);
    }
}
