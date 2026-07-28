package com.company.ecommerce.controller;

import com.company.ecommerce.dto.response.ApiResponse;
import com.company.ecommerce.dto.response.UserResponse;
import com.company.ecommerce.entity.User;
import com.company.ecommerce.exception.ResourceNotFoundException;
import com.company.ecommerce.mapper.UserMapper;
import com.company.ecommerce.repository.UserRepository;
import com.company.ecommerce.security.UserPrincipal;
import com.company.ecommerce.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Management API", description = "Endpoints for viewing current user profile and administrative user management")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Returns details of the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUserProfile(HttpServletRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUserPrincipal()
                .orElseThrow(() -> new ResourceNotFoundException("No authenticated user found"));

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentUser.getEmail()));

        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully", userMapper.toUserResponse(user), request.getRequestURI()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all users (Admin only)", description = "Retrieves all registered users in the platform. Requires ROLE_ADMIN or ROLE_SUPER_ADMIN.")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(HttpServletRequest request) {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users, request.getRequestURI()));
    }
}
