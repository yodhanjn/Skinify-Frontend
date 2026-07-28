# Skinify E-Commerce - Production-Ready Authentication & Authorization Backend

Enterprise-level RESTful Authentication & Authorization module built for the **Skinify** vinyl skins platform (Laptop, Mobile Phone, Gaming Consoles).

## 🚀 Technologies & Frameworks

- **Java 21 / 17**
- **Spring Boot 3.3.2**
- **Spring Security 6**
- **Spring Data JPA & Hibernate**
- **MySQL 8** (with existing schema support)
- **Flyway Database Migrations**
- **JJWT (io.jsonwebtoken) 0.12.6**
- **Jakarta Bean Validation**
- **Lombok & MapStruct 1.5.5**
- **Springdoc OpenAPI / Swagger UI 2.5**
- **Docker & Docker Compose**
- **JUnit 5 & Mockito**

---

## 🔒 Security Features

1. **BCrypt Password Encryptor**: Strength 12 hashing for all user credentials.
2. **Enterprise Password Policy**: Validated via custom `@ValidPassword` annotation enforcing:
   - Minimum 8, Maximum 64 characters
   - At least 1 uppercase letter (`A-Z`)
   - At least 1 lowercase letter (`a-z`)
   - At least 1 number (`0-9`)
   - At least 1 special character (`@#$%^&+=!_-...`)
3. **JWT Access & Refresh Token Architecture**:
   - Access tokens with configurable 15-minute expiration
   - Rotational Refresh Tokens stored securely in MySQL
   - Token revocation on device logout or password reset
4. **Brute-Force Account Locking**: Locks user account for 15 minutes after 5 consecutive failed login attempts. Automatically unlocks after duration.
5. **Rate Limiting**: Sliding window in-memory rate limiter per IP address for login, registration, password reset, and resend verification.
6. **Log Masking**: Custom utilities masking sensitive email data (`j***@domain.com`) and excluding tokens/passwords from SLF4J logs.
7. **Audit Logging**: Comprehensive database audit log table (`audit_logs`) tracking security events.

---

## 📋 API Endpoints

### Public Auth Endpoints (`/api/v1/auth`)

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate user & get JWT tokens
- `POST /api/v1/auth/refresh-token` - Issue new Access Token & rotated Refresh Token
- `GET  /api/v1/auth/verify-email?token={token}` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email link
- `POST /api/v1/auth/forgot-password` - Request 15-minute password reset link
- `POST /api/v1/auth/reset-password` - Reset password using hashed token

### Protected Endpoints (Requires `Bearer <JWT_TOKEN>`)

- `POST /api/v1/auth/logout` - Revoke tokens (current or all devices)
- `POST /api/v1/auth/change-password` - Change account password
- `GET  /api/v1/users/me` - Get profile of authenticated user
- `GET  /api/v1/users` - List all users (Requires `ROLE_ADMIN` or `ROLE_SUPER_ADMIN`)

---

## 🛠️ Setup & Running

### Prerequisites

- Java 17 or Java 21 JDK
- Maven 3.8+
- MySQL 8 (Running on localhost:3306 or via Docker)

### Option 1: Local Setup

1. Run Flyway migrations and build the backend:
```bash
mvn clean package
```

2. Run the application:
```bash
mvn spring-boot:run
```

3. Open Swagger UI in browser:
   `http://localhost:8080/swagger-ui.html`

### Option 2: Docker Compose

```bash
docker-compose up -d --build
```

---

## 🧪 Testing & Verification

Run automated JUnit 5 & Mockito test suite:
```bash
mvn test
```
