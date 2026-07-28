package com.company.ecommerce.security;

import com.company.ecommerce.entity.Role;
import com.company.ecommerce.entity.RoleName;
import com.company.ecommerce.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        // 256-bit Base64 secret key
        String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 900000L);

        User user = User.builder()
                .userId(1)
                .username("john.doe@example.com")
                .email("john.doe@example.com")
                .password("encoded_password")
                .roles(Set.of(Role.builder().roleId(1).name(RoleName.ROLE_USER).build()))
                .isEnabled(true)
                .isAccountNonLocked(true)
                .build();

        userPrincipal = UserPrincipal.create(user);
    }

    @Test
    @DisplayName("Should generate valid JWT Access Token and extract claims correctly")
    void shouldGenerateAndValidateToken() {
        Authentication auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        String token = jwtTokenProvider.generateAccessToken(auth);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateJwtToken(token));
        assertEquals("john.doe@example.com", jwtTokenProvider.getEmailFromJwtToken(token));
    }

    @Test
    @DisplayName("Should reject invalid or malformed JWT token")
    void shouldRejectMalformedToken() {
        String invalidToken = "invalid.token.string";
        assertFalse(jwtTokenProvider.validateJwtToken(invalidToken));
    }
}
