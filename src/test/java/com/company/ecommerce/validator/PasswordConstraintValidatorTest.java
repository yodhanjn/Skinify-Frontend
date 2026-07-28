package com.company.ecommerce.validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordConstraintValidatorTest {

    private PasswordConstraintValidator validator;

    @BeforeEach
    void setUp() {
        validator = new PasswordConstraintValidator();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "ValidP@ssword123",
            "Skinify#2026Strong",
            "P@ssw0rd!Complex",
            "A1@bcdefgh"
    })
    @DisplayName("Should accept valid passwords meeting all complexity criteria")
    void shouldAcceptValidPasswords(String password) {
        assertTrue(validator.isValid(password, null));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "short1!",           // Less than 8 chars
            "nocaps123!",        // No uppercase
            "NOLOWER123!",       // No lowercase
            "NoDigits!@#$",      // No digits
            "NoSpecialChar123",  // No special characters
            "   ",               // Whitespace
            ""                   // Empty
    })
    @DisplayName("Should reject invalid passwords failing complexity criteria")
    void shouldRejectInvalidPasswords(String password) {
        assertFalse(validator.isValid(password, null));
    }

    @Test
    @DisplayName("Should reject null password")
    void shouldRejectNullPassword() {
        assertFalse(validator.isValid(null, null));
    }
}
