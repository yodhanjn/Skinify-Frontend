package com.company.ecommerce.security;

import com.company.ecommerce.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {

    private final Integer id;
    private final String username;
    private final String email;
    @JsonIgnore
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;
    private final boolean accountNonLocked;

    public static UserPrincipal create(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            authorities.addAll(user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                    .collect(Collectors.toSet()));
        } else if (user.getLegacyRole() != null) {
            // Fallback for existing legacy roles
            String roleName = user.getLegacyRole().startsWith("ROLE_") ? user.getLegacyRole() : "ROLE_" + user.getLegacyRole();
            authorities.add(new SimpleGrantedAuthority(roleName));
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return UserPrincipal.builder()
                .id(user.getUserId())
                .username(user.getUsername() != null ? user.getUsername() : user.getEmail())
                .email(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .enabled(Boolean.TRUE.equals(user.getIsEnabled()))
                .accountNonLocked(Boolean.TRUE.equals(user.getIsAccountNonLocked()))
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
