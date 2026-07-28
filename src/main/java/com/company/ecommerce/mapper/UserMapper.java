package com.company.ecommerce.mapper;

import com.company.ecommerce.dto.request.RegisterRequest;
import com.company.ecommerce.dto.response.UserResponse;
import com.company.ecommerce.entity.Role;
import com.company.ecommerce.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRolesToStrings")
    UserResponse toUserResponse(User user);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "isEnabled", ignore = true)
    @Mapping(target = "isAccountNonLocked", ignore = true)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "lockTime", ignore = true)
    @Mapping(target = "legacyRole", ignore = true)
    @Mapping(target = "username", source = "email") // Default username to email if not specified separately
    User toUser(RegisterRequest registerRequest);

    @Named("mapRolesToStrings")
    default Set<String> mapRolesToStrings(Set<Role> roles) {
        if (roles == null) {
            return Set.of();
        }
        return roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
    }
}
