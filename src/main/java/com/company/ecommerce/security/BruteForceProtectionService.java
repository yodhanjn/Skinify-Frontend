package com.company.ecommerce.security;

import com.company.ecommerce.entity.User;
import com.company.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class BruteForceProtectionService {

    @Value("${app.security.auth.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.security.auth.lock-duration-minutes:15}")
    private int lockDurationMinutes;

    private final UserRepository userRepository;

    @Transactional
    public void recordFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= maxFailedAttempts) {
            user.setIsAccountNonLocked(false);
            user.setLockTime(LocalDateTime.now());
            log.warn("Account locked for user email: {} after {} failed attempts", user.getEmail(), attempts);
        }

        userRepository.save(user);
    }

    @Transactional
    public void resetFailedLoginAttempts(User user) {
        if (user.getFailedLoginAttempts() > 0 || !Boolean.TRUE.equals(user.getIsAccountNonLocked())) {
            user.setFailedLoginAttempts(0);
            user.setIsAccountNonLocked(true);
            user.setLockTime(null);
            userRepository.save(user);
        }
    }

    @Transactional
    public boolean checkUnlockTime(User user) {
        if (!Boolean.TRUE.equals(user.getIsAccountNonLocked()) && user.getLockTime() != null) {
            LocalDateTime unlockTime = user.getLockTime().plusMinutes(lockDurationMinutes);
            if (LocalDateTime.now().isAfter(unlockTime)) {
                user.setIsAccountNonLocked(true);
                user.setFailedLoginAttempts(0);
                user.setLockTime(null);
                userRepository.save(user);
                log.info("Account automatically unlocked for user email: {}", user.getEmail());
                return true;
            }
            return false;
        }
        return true;
    }
}
