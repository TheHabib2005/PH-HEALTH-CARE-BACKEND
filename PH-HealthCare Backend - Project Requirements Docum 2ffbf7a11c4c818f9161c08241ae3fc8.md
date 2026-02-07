# PH-HealthCare Backend - Project Requirements Document

### Project Overview

PH-HealthCare is a comprehensive **healthcare management system backend** built with modern web technologies, designed to facilitate seamless interaction between healthcare providers (doctors) and patients through a robust, secure, and scalable API infrastructure.

### Business Context

The healthcare industry requires:

- **Secure patient data management**
- **Efficient appointment scheduling** and management
- **Integrated payment processing** for medical services
- **Digital prescription** and medical record management
- **Real-time communication** capabilities (video consultations)
- **Performance optimization** through intelligent caching
- **Audit trails** for all critical operations

### Technical Scope

This project delivers a **production-grade RESTful API** that handles:

- Multi-role authentication and authorization
- Complete appointment lifecycle management
- Financial transaction processing
- Medical data storage and retrieval
- Real-time scheduling and availability management
- Document management for medical reports
- Performance monitoring and logging

---

## 🏗️ System Architecture Overview

### Technology Stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Runtime** | Node.js | 20.x LTS | JavaScript runtime environment |
| **Framework** | Express.js | Latest | Web application framework |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Database** | PostgreSQL | 16.x | Primary data store |
| **ORM** | Prisma | 7.x | Database access layer |
| **Cache** | Redis | Latest | Performance optimization |
| **Authentication** | Better Auth | Latest | User authentication system |
| **Payment** | Stripe | Latest | Payment processing |
| **Logging** | Winston | Latest | Application logging |
| **Validation** | Zod | Latest | Schema validation |

### System Characteristics

- **Architecture Pattern**: Layered Architecture (Controller → Service → Repository)
- **API Design**: RESTful with JSON payload
- **Authentication**: Token-based (JWT) with session management
- **Data Model**: Relational with soft-delete pattern
- **Caching Strategy**: Redis for frequently accessed data
- **File Storage**: Cloud storage (AWS S3) for medical documents
- **Deployment**: Cloud-native, containerizable

---

## 📊 Project Stakeholders

### User Roles

1. **Super Admin** - Full system access, manage all entities
2. **Admin** - Manage doctors, patients, view reports
3. **Doctor** - Manage appointments, write prescriptions, view patient data
4. **Patient** - Book appointments, view prescriptions, upload medical reports

### External Integrations

- **Stripe** - Payment gateway for appointment fees
- **Cloud Storage** (S3/GCS) - Medical document storage
- **Email Service** - Notification system
- **Video Call Service** (Twilio/Zoom) - Telemedicine consultations

---

## 📑 STEP 2: FUNCTIONAL REQUIREMENTS

---

## 2.1 Authentication & Authorization Module

### 2.1.1 User Registration

### FR-AUTH-001: Email-Based Registration

**Priority**: CRITICAL

**User Story**: As a new user, I want to register with my email and password so that I can access the system.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-001.1 | System must accept email and password for registration | - Email format validation (RFC 5322 compliant)- Password minimum 8 characters- Password must contain: uppercase, lowercase, number, special char |
| FR-AUTH-001.2 | System must validate email uniqueness | - Duplicate email returns error with 409 status- Case-insensitive email comparison |
| FR-AUTH-001.3 | System must hash passwords securely | - Use bcrypt with minimum 10 rounds- Never store plain-text passwords- Salt generated per password |
| FR-AUTH-001.4 | System must assign default role | - New registrations default to PATIENT role- Role assignment is atomic with user creation |
| FR-AUTH-001.5 | System must create user profile | - Create corresponding Patient profile- Profile linked via userId (one-to-one)- Profile created in same transaction |
| FR-AUTH-001.6 | System must set initial account status | - New accounts set to PENDING status- Status changes to ACTIVE after email verification |

**Input Validation Rules**:

```tsx
{
  email: string (valid email format, max 255 chars),
  password: string (min 8, max 100 chars),
  name: string (min 2, max 100 chars),
  contactNumber: string (optional, valid phone format),
  address: string (optional, max 500 chars)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-v7",
    "email": "user@example.com",
    "role": "PATIENT",
    "status": "PENDING"
  }
}
```

**Error Scenarios**:

- Invalid email format → HTTP 400 Bad Request
- Duplicate email → HTTP 409 Conflict
- Weak password → HTTP 400 Bad Request
- Missing required fields → HTTP 400 Bad Request

---

### FR-AUTH-002: Email Verification

**Priority**: HIGH

**User Story**: As a registered user, I want to verify my email address so that my account becomes active.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-002.1 | System must send verification email | - Email sent immediately after registration- Contains unique verification token- Token expires after 24 hours |
| FR-AUTH-002.2 | System must generate secure tokens | - Token minimum 32 characters- Cryptographically random (crypto.randomBytes)- Stored hashed in database |
| FR-AUTH-002.3 | System must verify token validity | - Check token existence- Check expiration time- Check if already used (one-time use) |
| FR-AUTH-002.4 | System must activate account on verification | - Update user status from PENDING to ACTIVE- Delete used verification token- Log verification event |
| FR-AUTH-002.5 | System must allow resend verification email | - Rate limit: 1 request per 5 minutes- Generate new token- Invalidate old token |

**Email Template Requirements**:

- Subject: “Verify Your PH-HealthCare Account”
- Contains verification link with token
- Professional HTML template
- Mobile-responsive design

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### FR-AUTH-003: User Login

**Priority**: CRITICAL

**User Story**: As a registered user, I want to log in with my credentials so that I can access my account.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-003.1 | System must authenticate with email/password | - Accept email and password- Verify credentials against database- Use secure comparison (timing-safe) |
| FR-AUTH-003.2 | System must validate account status | - Only ACTIVE accounts can login- BLOCKED accounts return 403 Forbidden- PENDING accounts return verification reminder- DELETED accounts return 404 Not Found |
| FR-AUTH-003.3 | System must generate session tokens | - Create JWT with user ID, role, email- Token expiry: 7 days (configurable)- Store session in database (Better Auth) |
| FR-AUTH-003.4 | System must track login sessions | - Store session ID, IP address, user agent- Update last login timestamp- Allow multiple concurrent sessions |
| FR-AUTH-003.5 | System must implement rate limiting | - Max 5 failed attempts per 15 minutes- Lock account after 10 failed attempts- Admin unlock required |
| FR-AUTH-003.6 | System must return user profile data | - Include user ID, email, role, name- Include profile data (admin/doctor/patient)- Exclude sensitive fields (password) |

**Input Validation**:

```tsx
{
  email: string (required, valid format),
  password: string (required)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "PATIENT",
      "status": "ACTIVE"
    },
    "token": "jwt-token-string",
    "expiresIn": "7d"
  }
}
```

**Error Scenarios**:

- Invalid credentials → HTTP 401 Unauthorized
- Account blocked → HTTP 403 Forbidden
- Email not verified → HTTP 403 Forbidden (with verification link)
- Account deleted → HTTP 404 Not Found

---

### FR-AUTH-004: Password Reset

**Priority**: HIGH

**User Story**: As a user who forgot my password, I want to reset it using my email so that I can regain access to my account.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-004.1 | System must accept password reset request | - Accept email address only- Validate email format- Don’t reveal if email exists (security) |
| FR-AUTH-004.2 | System must send reset email | - Send email to registered address only- Email contains secure reset token- Token valid for 1 hour only |
| FR-AUTH-004.3 | System must generate secure reset tokens | - Token minimum 32 characters- Cryptographically random- One-time use only |
| FR-AUTH-004.4 | System must validate reset token | - Check token existence in database- Verify token not expired- Verify token not already used |
| FR-AUTH-004.5 | System must update password securely | - Hash new password with bcrypt- Invalidate all existing sessions- Delete used reset token- Force re-login |
| FR-AUTH-004.6 | System must enforce password policy | - Same validation as registration- Cannot reuse last 3 passwords- Minimum 8 characters with complexity |
| FR-AUTH-004.7 | System must rate limit reset requests | - Max 3 requests per email per hour- Prevent automated attacks- Log suspicious activity |

**Reset Email Template Requirements**:

- Subject: “Reset Your PH-HealthCare Password”
- Contains reset link with token
- Link expires in 1 hour (clear message)
- Warning about not sharing link
- Contact support link if not requested

**Input Validation** (Request Reset):

```tsx
{
  email: string (required, valid format)
}
```

**Input Validation** (Confirm Reset):

```tsx
{
  token: string (required, 32+ chars),
  newPassword: string (required, 8-100 chars, complexity rules)
}
```

**Success Response** (Request): HTTP 200 OK

```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

**Success Response** (Confirm): HTTP 200 OK

```json
{
  "success": true,
  "message": "Password reset successfully. Please login with new password"
}
```

**Error Scenarios**:

- Invalid token → HTTP 400 Bad Request
- Expired token → HTTP 400 Bad Request
- Token already used → HTTP 400 Bad Request
- Weak password → HTTP 400 Bad Request
- Password reuse → HTTP 400 Bad Request (last 3 passwords)

---

### FR-AUTH-005: Change Password

**Priority**: MEDIUM

**User Story**: As a logged-in user, I want to change my password so that I can maintain account security.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-005.1 | System must require authentication | - User must be logged in (valid JWT)- Session must be active- Account status must be ACTIVE |
| FR-AUTH-005.2 | System must verify current password | - User must provide current password- Verify against stored hash- Fail if incorrect (security) |
| FR-AUTH-005.3 | System must validate new password | - Same complexity rules as registration- Different from current password- Cannot reuse last 3 passwords |
| FR-AUTH-005.4 | System must update password securely | - Hash new password with bcrypt- Update password field atomically- Store old password hash for history |
| FR-AUTH-005.5 | System must handle force password change | - Check User.needPasswordChange flag- If true, redirect to change password- Block other API access until changed |
| FR-AUTH-005.6 | System must invalidate other sessions | - Keep current session active- Logout all other devices/sessions- Send email notification |
| FR-AUTH-005.7 | System must log password change | - Log timestamp, IP address- Send confirmation email- Audit trail for security |

**Input Validation**:

```tsx
{
  currentPassword: string (required),
  newPassword: string (required, 8-100 chars),
  confirmPassword: string (required, must match newPassword)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "sessionInvalidated": true,
    "notificationSent": true
  }
}
```

**Error Scenarios**:

- Incorrect current password → HTTP 401 Unauthorized
- Weak new password → HTTP 400 Bad Request
- Password mismatch → HTTP 400 Bad Request
- Password reuse → HTTP 400 Bad Request
- Not authenticated → HTTP 401 Unauthorized

---

### FR-AUTH-006: Logout

**Priority**: HIGH

**User Story**: As a logged-in user, I want to logout so that my session is terminated securely.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-006.1 | System must terminate current session | - Delete session from database- Invalidate JWT token (blacklist)- Clear session cookies |
| FR-AUTH-006.2 | System must support logout from all devices | - Provide “logout everywhere” option- Delete all user sessions- Invalidate all tokens |
| FR-AUTH-006.3 | System must log logout activity | - Record logout timestamp- Log IP address and device- Audit trail for security |
| FR-AUTH-006.4 | System must handle concurrent logouts | - Gracefully handle already logged-out sessions- Return success even if no active session |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Success Response** (Logout All): HTTP 200 OK

```json
{
  "success": true,
  "message": "Logged out from all devices",
  "data": {
    "sessionsTerminated": 3
  }
}
```

---

### FR-AUTH-007: Session Management

**Priority**: HIGH

**User Story**: As a logged-in user, I want to view and manage my active sessions so that I can ensure account security.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-007.1 | System must list active sessions | - Show all active sessions for user- Include device info, IP, last activity- Highlight current session |
| FR-AUTH-007.2 | System must allow session termination | - User can terminate specific session- Cannot terminate current session this way- Confirmation required |
| FR-AUTH-007.3 | System must auto-expire inactive sessions | - Sessions expire after 7 days- Cleanup job runs daily- Expired sessions deleted from database |
| FR-AUTH-007.4 | System must limit concurrent sessions | - Max 5 active sessions per user- Oldest session auto-terminated when limit reached- User notified of termination |

**Success Response** (List Sessions): HTTP 200 OK

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "device": "Chrome on Windows",
        "ipAddress": "192.168.1.1",
        "lastActivity": "2026-01-29T10:30:00Z",
        "isCurrent": true,
        "expiresAt": "2026-02-05T10:30:00Z"
      }
    ]
  }
}
```

---

## 2.2 Role-Based Access Control (RBAC)

### 2.2.1 Role Definition & Hierarchy

### FR-RBAC-001: User Role System

**Priority**: CRITICAL

**User Story**: As a system architect, I want to define user roles with specific permissions so that access control is properly enforced.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-RBAC-001.1 | System must support four distinct roles | - SUPER_ADMIN: Full system access- ADMIN: Manage users and view reports- DOCTOR: Medical operations- PATIENT: Consumer operations |
| FR-RBAC-001.2 | System must enforce role hierarchy | - SUPER_ADMIN > ADMIN > DOCTOR > PATIENT- Higher roles inherit lower role permissions- Role cannot be null |
| FR-RBAC-001.3 | System must validate role on every request | - Extract role from JWT token- Verify role exists in enum- Block request if role invalid |
| FR-RBAC-001.4 | System must link role to profile type | - ADMIN/SUPER_ADMIN → Admin profile- DOCTOR → Doctor profile- PATIENT → Patient profile- One-to-one relationship enforced |

**Role Permission Matrix**:

| Resource | SUPER_ADMIN | ADMIN | DOCTOR | PATIENT |
| --- | --- | --- | --- | --- |
| Manage Admins | ✅ | ❌ | ❌ | ❌ |
| Manage Doctors | ✅ | ✅ | ❌ | ❌ |
| Manage Patients | ✅ | ✅ | ❌ | ❌ |
| Manage Specialties | ✅ | ✅ | ❌ | ❌ |
| View All Appointments | ✅ | ✅ | ❌ | ❌ |
| Manage Own Schedule | ❌ | ❌ | ✅ | ❌ |
| View Own Appointments | ❌ | ❌ | ✅ | ✅ |
| Book Appointments | ❌ | ❌ | ❌ | ✅ |
| Write Prescriptions | ❌ | ❌ | ✅ | ❌ |
| View Prescriptions | ❌ | ❌ | ✅ (own) | ✅ (own) |
| Submit Reviews | ❌ | ❌ | ❌ | ✅ |
| Upload Medical Reports | ❌ | ❌ | ❌ | ✅ |
| View Patient Health Data | ❌ | ❌ | ✅ (assigned) | ✅ (own) |
| System Logs | ✅ | ✅ | ❌ | ❌ |

---

### FR-RBAC-002: Authorization Middleware

**Priority**: CRITICAL

**User Story**: As a developer, I want reusable authorization middleware so that I can protect routes consistently.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-RBAC-002.1 | System must provide authentication middleware | - Verify JWT token validity- Check token expiration- Extract user data from token- Attach user to request object |
| FR-RBAC-002.2 | System must provide role-based middleware | - Accept allowed roles as parameter- Compare user role with allowed roles- Return 403 if unauthorized- Support multiple roles per route |
| FR-RBAC-002.3 | System must validate account status | - Check user status is ACTIVE- Block BLOCKED, PENDING, DELETED accounts- Return appropriate error messages |
| FR-RBAC-002.4 | System must handle missing/invalid tokens | - Return 401 for missing token- Return 401 for invalid/expired token- Return 401 for tampered token |
| FR-RBAC-002.5 | System must support resource ownership checks | - Verify user owns the resource- Allow access to own data- Block access to others’ data- Admin override capability |

**Middleware Usage Pattern**:

```tsx
// Route protection examples
router.get(
  "/appointments",
  authenticate,
  authorize(["SUPER_ADMIN", "ADMIN"]),
  appointmentController.getAll,
);

router.get(
  "/appointments/my",
  authenticate,
  authorize(["DOCTOR", "PATIENT"]),
  appointmentController.getMy,
);

router.post(
  "/prescription",
  authenticate,
  authorize(["DOCTOR"]),
  prescriptionController.create,
);
```

**Error Response** (Unauthorized): HTTP 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Required roles: SUPER_ADMIN, ADMIN",
  "statusCode": 403
}
```

---

### FR-RBAC-003: Resource Ownership Validation

**Priority**: HIGH

**User Story**: As a user, I want to ensure that I can only access my own data and not others’ private information.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-RBAC-003.1 | System must validate patient data ownership | - Patients can only view own appointments- Patients can only view own prescriptions- Patients can only view own medical reports- Patients can only edit own profile |
| FR-RBAC-003.2 | System must validate doctor data ownership | - Doctors can view appointments assigned to them- Doctors can write prescriptions for own patients- Doctors can view health data of assigned patients- Doctors can manage own schedule |
| FR-RBAC-003.3 | System must implement admin override | - Admins can view all user data (except passwords)- Super admins have unrestricted access- All admin actions logged for audit |
| FR-RBAC-003.4 | System must check ownership at service layer | - Ownership check in service methods- Not just at controller level- Prevents bypass through direct service calls |

**Ownership Validation Logic**:

```tsx
// Example: Patient viewing appointment
if (user.role === "PATIENT") {
  // Must be their own appointment
  if (appointment.patientId !== user.patientId) {
    throw new ForbiddenError("Access denied");
  }
}

// Example: Doctor viewing patient health data
if (user.role === "DOCTOR") {
  // Must have appointment with patient
  const hasAppointment = await checkDoctorPatientRelation(
    user.doctorId,
    patientId,
  );
  if (!hasAppointment) {
    throw new ForbiddenError("No treatment relationship");
  }
}
```

---

## 2.3 User Profile Management

### 2.3.1 Admin Management

### FR-ADMIN-001: Create Admin User

**Priority**: HIGH

**User Story**: As a super admin, I want to create admin accounts so that I can delegate system management tasks.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-ADMIN-001.1 | System must allow super admin to create admins | - Only SUPER_ADMIN can create admins- Create User + Admin profile atomically- Transaction rollback on failure |
| FR-ADMIN-001.2 | System must validate admin data | - Name required (2-100 chars)- Email required and unique- Contact number optional but validated- Profile photo optional (URL format) |
| FR-ADMIN-001.3 | System must set appropriate defaults | - Role set to ADMIN- Status set to ACTIVE- needPasswordChange set to true- Email denormalized to Admin table |
| FR-ADMIN-001.4 | System must send welcome email | - Email with temporary password- Force password change on first login- Account activation link |

**Input Validation**:

```tsx
{
  name: string (required, 2-100 chars),
  email: string (required, valid format, unique),
  password: string (required, 8-100 chars),
  contactNumber: string (optional, valid phone),
  profilePhoto: string (optional, valid URL)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "admin-uuid",
    "email": "admin@example.com",
    "name": "John Smith",
    "role": "ADMIN",
    "status": "ACTIVE",
    "needPasswordChange": true
  }
}
```

---

### FR-ADMIN-002: Update Admin Profile

**Priority**: MEDIUM

**User Story**: As an admin, I want to update my profile information so that my details remain current.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-ADMIN-002.1 | System must allow admin self-update | - Admin can update own profile- Cannot change email (requires verification)- Cannot change role (requires super admin) |
| FR-ADMIN-002.2 | System must allow super admin to update any admin | - Super admin can update any admin profile- Can change role (ADMIN ↔︎ SUPER_ADMIN)- Can change status (ACTIVE/BLOCKED) |
| FR-ADMIN-002.3 | System must validate update data | - Name validation (if provided)- Contact number validation (if provided)- Profile photo URL validation (if provided) |
| FR-ADMIN-002.4 | System must sync with User table | - Update email in User table if changed- Maintain referential integrity- Atomic transaction |
| FR-ADMIN-002.5 | System must invalidate cache | - Clear admin cache after update- Clear user cache after update- Ensure consistency |

**Input Validation**:

```tsx
{
  name: string (optional, 2-100 chars),
  contactNumber: string (optional, valid phone),
  profilePhoto: string (optional, valid URL)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Admin profile updated successfully",
  "data": {
    "id": "admin-uuid",
    "name": "John Smith Updated",
    "email": "admin@example.com",
    "contactNumber": "+1234567890",
    "profilePhoto": "https://example.com/photo.jpg"
  }
}
```

---

### FR-ADMIN-003: Get Admin List

**Priority**: MEDIUM

**User Story**: As a super admin, I want to view all admin accounts so that I can manage the team.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-ADMIN-003.1 | System must return paginated admin list | - Support page and limit parameters- Default: page=1, limit=10- Max limit: 100 |
| FR-ADMIN-003.2 | System must support filtering | - Filter by status (ACTIVE, BLOCKED)- Filter by role (ADMIN, SUPER_ADMIN)- Search by name or email |
| FR-ADMIN-003.3 | System must support sorting | - Sort by createdAt (default: DESC)- Sort by name (A-Z, Z-A)- Sort by email |
| FR-ADMIN-003.4 | System must exclude soft-deleted records | - Check isDeleted = false- Include deletedAt timestamp in response- Option to include deleted (super admin) |
| FR-ADMIN-003.5 | System must exclude sensitive data | - Never return password hash- Never return internal IDs- Sanitize response |

**Query Parameters**:

```tsx
{
  page: number (default: 1, min: 1),
  limit: number (default: 10, max: 100),
  searchTerm: string (optional, search name/email),
  status: 'ACTIVE' | 'BLOCKED' (optional),
  role: 'ADMIN' | 'SUPER_ADMIN' (optional),
  sortBy: 'createdAt' | 'name' | 'email' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": [
    {
      "id": "admin-uuid",
      "name": "John Smith",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 2.3.2 Doctor Management

### FR-DOCTOR-001: Create Doctor Profile

**Priority**: HIGH

**User Story**: As an admin, I want to create doctor accounts so that healthcare providers can use the system.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-001.1 | System must allow admin to create doctors | - SUPER_ADMIN and ADMIN can create doctors- Create User + Doctor profile atomically- Transaction rollback on failure |
| FR-DOCTOR-001.2 | System must validate doctor data | - Name required (2-100 chars)- Email required and unique- Contact number required (doctors must be reachable)- Registration number required and unique (medical license) |
| FR-DOCTOR-001.3 | System must validate medical credentials | - Registration number format validation- Qualification required (e.g., “MBBS, MD”)- Experience must be non-negative integer- Current working place required |
| FR-DOCTOR-001.4 | System must validate financial information | - Appointment fee required- Fee stored as integer (cents/paisa)- Fee must be positive (>0)- Fee reasonable range (100-1000000 cents) |
| FR-DOCTOR-001.5 | System must set appropriate defaults | - Role set to DOCTOR- Status set to ACTIVE- needPasswordChange set to true- averageRating set to 0- totalReviews set to 0- Email denormalized to Doctor table |
| FR-DOCTOR-001.6 | System must handle specialty assignment | - Optionally accept specialty IDs- Create DoctorSpecialty records- Validate specialty IDs exist- Support multiple specialties |
| FR-DOCTOR-001.7 | System must send welcome email | - Email with temporary password- Doctor portal login instructions- Force password change on first login |

**Input Validation**:

```tsx
{
  name: string (required, 2-100 chars),
  email: string (required, valid format, unique),
  password: string (required, 8-100 chars),
  contactNumber: string (required, valid phone),
  address: string (optional, max 500 chars),
  registrationNumber: string (required, unique, alphanumeric),
  experience: number (required, min: 0, max: 70),
  gender: 'MALE' | 'FEMALE' | 'OTHER' (required),
  appointmentFee: number (required, min: 100, max: 1000000),
  qualification: string (required, 2-200 chars),
  currentWorkingPlace: string (required, 2-200 chars),
  designation: string (required, 2-100 chars),
  bio: string (optional, max 1000 chars),
  profilePhoto: string (optional, valid URL),
  specialtyIds: string[] (optional, array of valid UUIDs)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": "doctor-uuid",
    "email": "doctor@example.com",
    "name": "Dr. Jane Smith",
    "registrationNumber": "BM123456",
    "appointmentFee": 5000,
    "experience": 10,
    "qualification": "MBBS, MD (Cardiology)",
    "designation": "Senior Cardiologist",
    "role": "DOCTOR",
    "status": "ACTIVE",
    "specialties": [
      {
        "id": "specialty-uuid",
        "title": "Cardiology"
      }
    ]
  }
}
```

**Error Scenarios**:

- Duplicate registration number → HTTP 409 Conflict
- Invalid specialty ID → HTTP 400 Bad Request
- Negative fee or experience → HTTP 400 Bad Request

---

### FR-DOCTOR-002: Update Doctor Profile

**Priority**: HIGH

**User Story**: As a doctor, I want to update my profile so that patients see accurate information.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-002.1 | System must allow doctor self-update | - Doctor can update own profile- Cannot change email (requires verification)- Cannot change registration number- Cannot change role |
| FR-DOCTOR-002.2 | System must allow admin to update any doctor | - Admin can update any doctor profile- Can change status (ACTIVE/BLOCKED)- Cannot change registration number (immutable) |
| FR-DOCTOR-002.3 | System must validate update data | - All field validations same as create- Partial update supported- Only provided fields validated |
| FR-DOCTOR-002.4 | System must handle specialty updates | - Add new specialties- Remove existing specialties- Atomic specialty update operation- Validate specialty IDs |
| FR-DOCTOR-002.5 | System must sync with User table | - Update email in User table if changed- Maintain referential integrity- Atomic transaction |
| FR-DOCTOR-002.6 | System must invalidate cache | - Clear doctor cache after update- Clear doctor list cache- Clear specialty-doctor cache |
| FR-DOCTOR-002.7 | System must not allow rating manipulation | - averageRating is read-only (calculated)- totalReviews is read-only (calculated)- Return error if attempted |

**Input Validation** (All fields optional):

```tsx
{
  name: string (optional, 2-100 chars),
  contactNumber: string (optional, valid phone),
  address: string (optional, max 500 chars),
  experience: number (optional, min: 0, max: 70),
  appointmentFee: number (optional, min: 100, max: 1000000),
  qualification: string (optional, 2-200 chars),
  currentWorkingPlace: string (optional, 2-200 chars),
  designation: string (optional, 2-100 chars),
  bio: string (optional, max 1000 chars),
  profilePhoto: string (optional, valid URL),
  specialtyIds: string[] (optional, replace all specialties)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "id": "doctor-uuid",
    "name": "Dr. Jane Smith Updated",
    "appointmentFee": 6000,
    "bio": "Experienced cardiologist with 10+ years",
    "specialties": [
      {
        "id": "specialty-1",
        "title": "Cardiology"
      },
      {
        "id": "specialty-2",
        "title": "Internal Medicine"
      }
    ]
  }
}
```

---

### FR-DOCTOR-003: Get Doctor List

**Priority**: CRITICAL

**User Story**: As a patient, I want to browse available doctors so that I can find the right specialist.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-003.1 | System must return paginated doctor list | - Support page and limit parameters- Default: page=1, limit=10- Max limit: 50 (performance) |
| FR-DOCTOR-003.2 | System must support filtering | - Filter by specialty (single or multiple)- Filter by gender- Filter by experience range (min-max)- Filter by fee range (min-max)- Search by name (partial match, case-insensitive) |
| FR-DOCTOR-003.3 | System must support sorting | - Sort by averageRating (default: DESC)- Sort by appointmentFee (ASC/DESC)- Sort by experience (DESC)- Sort by name (A-Z, Z-A) |
| FR-DOCTOR-003.4 | System must include related data | - Include specialties for each doctor- Include total reviews count- Include average rating- Do not include sensitive data (password, userId) |
| FR-DOCTOR-003.5 | System must exclude soft-deleted records | - Check isDeleted = false- Only show ACTIVE doctors to patients- Admins can see BLOCKED doctors |
| FR-DOCTOR-003.6 | System must implement caching | - Cache doctor list for 5 minutes- Cache key includes all filters/sort- Invalidate on any doctor update |

**Query Parameters**:

```tsx
{
  page: number (default: 1, min: 1),
  limit: number (default: 10, max: 50),
  searchTerm: string (optional, search name/qualification),
  specialtyIds: string[] (optional, filter by specialties),
  gender: 'MALE' | 'FEMALE' | 'OTHER' (optional),
  minExperience: number (optional, min: 0),
  maxExperience: number (optional),
  minFee: number (optional, in cents),
  maxFee: number (optional, in cents),
  sortBy: 'averageRating' | 'appointmentFee' | 'experience' | 'name',
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctors retrieved successfully",
  "data": [
    {
      "id": "doctor-uuid",
      "name": "Dr. Jane Smith",
      "email": "doctor@example.com",
      "contactNumber": "+1234567890",
      "registrationNumber": "BM123456",
      "experience": 10,
      "gender": "FEMALE",
      "appointmentFee": 5000,
      "qualification": "MBBS, MD (Cardiology)",
      "currentWorkingPlace": "City Hospital",
      "designation": "Senior Cardiologist",
      "bio": "Experienced cardiologist...",
      "profilePhoto": "https://example.com/photo.jpg",
      "averageRating": 4.8,
      "totalReviews": 150,
      "specialties": [
        {
          "id": "specialty-uuid",
          "title": "Cardiology",
          "icon": "https://example.com/icon.png"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### FR-DOCTOR-004: Get Doctor by ID

**Priority**: HIGH

**User Story**: As a patient, I want to view detailed doctor information so that I can make an informed decision.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-004.1 | System must return complete doctor profile | - All public fields included- Include all specialties- Include recent reviews (last 5)- Calculate rating statistics |
| FR-DOCTOR-004.2 | System must validate doctor existence | - Return 404 if doctor not found- Return 404 if doctor soft-deleted- Return 403 if doctor blocked (for patients) |
| FR-DOCTOR-004.3 | System must include availability status | - Check if doctor has available schedule slots- Show next available date (if any)- Show total available slots this week |
| FR-DOCTOR-004.4 | System must implement caching | - Cache individual doctor for 10 minutes- Cache key: doctor ID- Invalidate on doctor update |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor retrieved successfully",
  "data": {
    "id": "doctor-uuid",
    "name": "Dr. Jane Smith",
    "email": "doctor@example.com",
    "contactNumber": "+1234567890",
    "address": "123 Medical Plaza",
    "registrationNumber": "BM123456",
    "experience": 10,
    "gender": "FEMALE",
    "appointmentFee": 5000,
    "qualification": "MBBS, MD (Cardiology)",
    "currentWorkingPlace": "City Hospital",
    "designation": "Senior Cardiologist",
    "bio": "Experienced cardiologist with 10+ years of practice...",
    "profilePhoto": "https://example.com/photo.jpg",
    "averageRating": 4.8,
    "totalReviews": 150,
    "specialties": [
      {
        "id": "specialty-uuid",
        "title": "Cardiology",
        "icon": "https://example.com/icon.png",
        "description": "Heart and cardiovascular diseases"
      }
    ],
    "recentReviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent doctor!",
        "patientName": "John D.",
        "createdAt": "2026-01-25T10:00:00Z"
      }
    ],
    "availability": {
      "hasAvailableSlots": true,
      "nextAvailableDate": "2026-01-30",
      "availableSlotsThisWeek": 12
    }
  }
}
```

**Error Scenarios**:

- Doctor not found → HTTP 404 Not Found
- Doctor deleted → HTTP 404 Not Found
- Doctor blocked (patient access) → HTTP 403 Forbidden

---

### FR-DOCTOR-005: Delete Doctor (Soft Delete)

**Priority**: MEDIUM

**User Story**: As an admin, I want to deactivate doctor accounts so that they no longer appear in active listings.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-005.1 | System must allow admin to soft delete | - Only SUPER_ADMIN and ADMIN can delete- Set isDeleted = true- Set deletedAt = current timestamp- Do not delete from database (data retention) |
| FR-DOCTOR-005.2 | System must handle related data | - Do not delete appointments (keep history)- Do not delete prescriptions- Do not delete reviews- Mark DoctorSchedule as inactive |
| FR-DOCTOR-005.3 | System must prevent future operations | - Cannot book new appointments- Cannot create new schedules- Cannot login (account blocked)- Past data remains accessible for audit |
| FR-DOCTOR-005.4 | System must notify affected users | - Send email to doctor (account deactivation)- Notify patients with upcoming appointments- Provide alternative doctor recommendations |
| FR-DOCTOR-005.5 | System must invalidate cache | - Clear doctor from cache- Clear doctor from list cache- Clear specialty-doctor cache |
| FR-DOCTOR-005.6 | System must log deletion | - Record who deleted (admin ID)- Record deletion timestamp- Record reason (if provided)- Audit trail for compliance |

**Input Validation**:

```tsx
{
  reason: string (optional, max 500 chars)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor account deactivated successfully",
  "data": {
    "id": "doctor-uuid",
    "name": "Dr. Jane Smith",
    "deletedAt": "2026-01-29T12:00:00Z",
    "upcomingAppointments": 3,
    "affectedPatients": 3
  }
}
```

**Business Rules**:

- Cannot delete doctor with appointments in next 24 hours (must reschedule first)
- Cannot delete doctor with pending prescriptions
- Super admin can override and force delete if necessary
- Deleted doctors can be restored by super admin

---

### 2.3.3 Patient Management

### FR-PATIENT-001: Update Patient Profile

**Priority**: HIGH

**User Story**: As a patient, I want to update my profile information so that my contact details remain current.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-001.1 | System must allow patient self-update | - Patient can update own profile- Cannot change email (requires verification)- Cannot change role- Update User and Patient tables atomically |
| FR-PATIENT-001.2 | System must allow admin to update patient | - Admin can update any patient profile- Can change status (ACTIVE/BLOCKED)- Cannot change email without verification |
| FR-PATIENT-001.3 | System must validate update data | - Name validation (if provided)- Contact number validation (if provided)- Address validation (if provided)- Profile photo URL validation |
| FR-PATIENT-001.4 | System must sync with User table | - Maintain referential integrity- Atomic transaction- Rollback on failure |
| FR-PATIENT-001.5 | System must invalidate cache | - Clear patient cache after update- Clear appointment cache if contact changed- Ensure data consistency |

**Input Validation** (All fields optional):

```tsx
{
  name: string (optional, 2-100 chars),
  contactNumber: string (optional, valid phone),
  address: string (optional, max 500 chars),
  profilePhoto: string (optional, valid URL)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient profile updated successfully",
  "data": {
    "id": "patient-uuid",
    "name": "John Doe Updated",
    "email": "patient@example.com",
    "contactNumber": "+1234567890",
    "address": "456 New Address",
    "profilePhoto": "https://example.com/photo.jpg"
  }
}
```

---

### FR-PATIENT-002: Get Patient List (Admin View)

**Priority**: MEDIUM

**User Story**: As an admin, I want to view all patients so that I can manage user accounts.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-002.1 | System must return paginated patient list | - Support page and limit parameters- Default: page=1, limit=10- Max limit: 100 |
| FR-PATIENT-002.2 | System must support filtering | - Filter by status (ACTIVE, BLOCKED, DELETED)- Search by name or email- Filter by registration date range |
| FR-PATIENT-002.3 | System must support sorting | - Sort by createdAt (default: DESC)- Sort by name (A-Z, Z-A)- Sort by email |
| FR-PATIENT-002.4 | System must include summary statistics | - Total appointments count- Total reviews count- Last appointment date |
| FR-PATIENT-002.5 | System must exclude soft-deleted by default | - Check isDeleted = false- Option to include deleted (admin only)- Never show passwords |
| FR-PATIENT-002.6 | System must implement authorization | - Only SUPER_ADMIN and ADMIN can access- Return 403 for other roles |

**Query Parameters**:

```tsx
{
  page: number (default: 1, min: 1),
  limit: number (default: 10, max: 100),
  searchTerm: string (optional, search name/email),
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED' (optional),
  includeDeleted: boolean (default: false, admin only),
  sortBy: 'createdAt' | 'name' | 'email' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Patients retrieved successfully",
  "data": [
    {
      "id": "patient-uuid",
      "name": "John Doe",
      "email": "patient@example.com",
      "contactNumber": "+1234567890",
      "address": "123 Main St",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z",
      "statistics": {
        "totalAppointments": 5,
        "totalReviews": 3,
        "lastAppointment": "2026-01-20T14:00:00Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

### FR-PATIENT-003: Get Patient by ID

**Priority**: MEDIUM

**User Story**: As an admin or doctor, I want to view patient details so that I can provide appropriate care.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-003.1 | System must return complete patient profile | - All public fields included- Include health data if exists- Include appointment history summary- Exclude password and sensitive tokens |
| FR-PATIENT-003.2 | System must validate access permissions | - Patient can view own profile- Doctor can view assigned patients only- Admin can view all patients- Return 403 for unauthorized access |
| FR-PATIENT-003.3 | System must include health information | - Include PatientHealthData if exists- Include recent medical reports (last 5)- Calculate health risk indicators |
| FR-PATIENT-003.4 | System must validate patient existence | - Return 404 if patient not found- Return 404 if patient soft-deleted- Appropriate error messages |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient retrieved successfully",
  "data": {
    "id": "patient-uuid",
    "name": "John Doe",
    "email": "patient@example.com",
    "contactNumber": "+1234567890",
    "address": "123 Main St",
    "profilePhoto": "https://example.com/photo.jpg",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:00:00Z",
    "healthData": {
      "id": "health-data-uuid",
      "dateOfBirth": "1990-05-15",
      "gender": "MALE",
      "bloodGroup": "A_POSITIVE",
      "heightCm": 175,
      "weightKg": 70,
      "bmi": 22.86,
      "allergies": "Penicillin",
      "chronicConditions": "None"
    },
    "statistics": {
      "totalAppointments": 5,
      "completedAppointments": 4,
      "cancelledAppointments": 1,
      "totalReviews": 3,
      "averageRatingGiven": 4.7
    }
  }
}
```

**Error Scenarios**:

- Patient not found → HTTP 404 Not Found
- Unauthorized access (doctor viewing non-assigned patient) → HTTP 403 Forbidden

---

### FR-PATIENT-004: Patient Health Data Management

**Priority**: HIGH

**User Story**: As a patient, I want to manage my health information so that doctors have accurate medical history.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-004.1 | System must create/update health data | - Patient can create health profile once- Patient can update health profile anytime- Upsert operation (create or update)- One-to-one relationship with Patient |
| FR-PATIENT-004.2 | System must validate health data | - Date of birth: past date, reasonable (18-120 years)- Height: 50-250 cm- Weight: 20-300 kg- BMI calculated automatically- Blood group enum validation |
| FR-PATIENT-004.3 | System must calculate BMI automatically | - Formula: weight(kg) / (height(m))²- Round to 2 decimal places- Update on height/weight change- Store calculated value |
| FR-PATIENT-004.4 | System must enforce data privacy | - Only patient can edit own data- Doctors can view assigned patients only- Admins have read-only access |
| FR-PATIENT-004.5 | System must validate optional fields | - Emergency contact validation- Marital status enum- Boolean fields nullable- Text fields sanitized |
| FR-PATIENT-004.6 | System must maintain audit trail | - Log all health data changes- Record who made changes- Timestamp all modifications- Compliance requirement |

**Input Validation**:

```tsx
{
  dateOfBirth: string (required, ISO date, past, age 18-120),
  gender: 'MALE' | 'FEMALE' | 'OTHER' (required),
  bloodGroup: 'A_POSITIVE' | 'A_NEGATIVE' | ... (optional),
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' (optional),
  heightCm: number (optional, 50-250),
  weightKg: number (optional, 20-300),
  allergies: string (optional, max 1000 chars),
  chronicConditions: string (optional, max 1000 chars),
  currentMedications: string (optional, max 1000 chars),
  familyMedicalHistory: string (optional, max 2000 chars),
  emergencyContactName: string (optional, 2-100 chars),
  emergencyContactPhone: string (optional, valid phone),
  smokingStatus: boolean (optional),
  alcoholConsumption: boolean (optional),
  dietaryPreferences: string (optional, max 500 chars)
}
```

**Success Response**: HTTP 201 Created (or 200 OK for update)

```json
{
  "success": true,
  "message": "Health data saved successfully",
  "data": {
    "id": "health-data-uuid",
    "patientId": "patient-uuid",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "bloodGroup": "A_POSITIVE",
    "maritalStatus": "MARRIED",
    "heightCm": 175,
    "weightKg": 70,
    "bmi": 22.86,
    "allergies": "Penicillin, Peanuts",
    "chronicConditions": "None",
    "currentMedications": "None",
    "familyMedicalHistory": "Diabetes (grandfather)",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1234567890",
    "smokingStatus": false,
    "alcoholConsumption": false,
    "dietaryPreferences": "Vegetarian"
  }
}
```

**BMI Categories** (for reference):

- Underweight: < 18.5
- Normal: 18.5 - 24.9
- Overweight: 25 - 29.9
- Obese: ≥ 30

---

### FR-PATIENT-005: Medical Report Upload

**Priority**: MEDIUM

**User Story**: As a patient, I want to upload medical reports so that doctors can access my medical history.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-005.1 | System must accept file uploads | - Support PDF, JPG, PNG formats- Max file size: 10MB- File type validation (MIME type)- Virus scanning before storage |
| FR-PATIENT-005.2 | System must upload to cloud storage | - Upload to AWS S3 or equivalent- Generate secure file URL- Set file permissions (private)- Return public signed URL (temporary) |
| FR-PATIENT-005.3 | System must store metadata in database | - Store file URL, not file itself- Store report name, type, notes- Link to patient (patientId)- Timestamp upload |
| FR-PATIENT-005.4 | System must validate report data | - Report name required (2-200 chars)- Report type enum validation- Notes optional (max 1000 chars)- File URL stored as string |
| FR-PATIENT-005.5 | System must enforce access control | - Only patient can upload own reports- Doctors can view assigned patients’ reports- Admins can view all reports- Signed URLs expire in 1 hour |
| FR-PATIENT-005.6 | System must list patient reports | - Paginated list of reports- Sort by upload date (newest first)- Filter by report type- Include download links |

**Input Validation** (Upload):

```tsx
{
  file: File (required, PDF/JPG/PNG, max 10MB),
  reportName: string (required, 2-200 chars),
  reportType: 'LAB_TEST' | 'IMAGING' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'OTHER',
  notes: string (optional, max 1000 chars)
}
```

**Success Response** (Upload): HTTP 201 Created

```json
{
  "success": true,
  "message": "Medical report uploaded successfully",
  "data": {
    "id": "report-uuid",
    "patientId": "patient-uuid",
    "reportName": "Blood Test Results",
    "reportType": "LAB_TEST",
    "fileUrl": "https://s3.amazonaws.com/bucket/reports/...",
    "notes": "Annual checkup blood work",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

**Success Response** (List Reports): HTTP 200 OK

```json
{
  "success": true,
  "message": "Medical reports retrieved successfully",
  "data": [
    {
      "id": "report-uuid",
      "reportName": "Blood Test Results",
      "reportType": "LAB_TEST",
      "fileUrl": "https://signed-url-expires-in-1hr",
      "notes": "Annual checkup",
      "createdAt": "2026-01-29T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**File Storage Structure**:

```
/medical-reports
  /{patientId}
    /{reportId}-{timestamp}.{extension}
```

**Error Scenarios**:

- File too large → HTTP 413 Payload Too Large
- Invalid file type → HTTP 400 Bad Request
- Virus detected → HTTP 422 Unprocessable Entity
- Upload failed → HTTP 500 Internal Server Error

**Business Rules**:

- Patients must complete health data before first appointment booking
- Health data required fields: DOB, gender
- BMI calculation triggers health risk alerts if outside normal range
- Medical reports retained for 7 years (compliance)
- Maximum 50 reports per patient
- Report files deleted from storage 90 days after patient account deletion

---

### 2.4 Specialty Management

### FR-SPECIALTY-001: Create Specialty

**Priority**: MEDIUM

**User Story**: As an admin, I want to create medical specialties so that doctors can be categorized by their expertise.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-001.1 | System must create specialty | - Accept title and icon (optional)- Generate unique ID- Store in Specialty table- Return created specialty |
| FR-SPECIALTY-001.2 | System must validate specialty data | - Title required (2-100 chars)- Title must be unique (case-insensitive)- Icon optional (valid URL or emoji)- Sanitize inputs |
| FR-SPECIALTY-001.3 | System must enforce authorization | - Only SUPER_ADMIN and ADMIN can create- Return 403 for other roles |
| FR-SPECIALTY-001.4 | System must handle duplicates | - Check existing specialty by title- Return 409 if duplicate found- Case-insensitive comparison |

**Input Validation**:

```tsx
{
  title: string (required, 2-100 chars, unique),
  icon: string (optional, max 500 chars)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Specialty created successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "icon": "❤️",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

**Error Scenarios**:

- Duplicate specialty title → HTTP 409 Conflict
- Invalid input → HTTP 400 Bad Request
- Unauthorized → HTTP 403 Forbidden

---

### FR-SPECIALTY-002: Update Specialty

**Priority**: LOW

**User Story**: As an admin, I want to update specialty information so that specialty details remain accurate.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-002.1 | System must update specialty | - Accept specialty ID and update data- Update title and/or icon- Partial update supported- Return updated specialty |
| FR-SPECIALTY-002.2 | System must validate update data | - Title validation if provided (2-100 chars)- Title uniqueness check (exclude self)- Icon validation if provided |
| FR-SPECIALTY-002.3 | System must enforce authorization | - Only SUPER_ADMIN and ADMIN can update- Return 403 for other roles |
| FR-SPECIALTY-002.4 | System must validate specialty exists | - Return 404 if specialty not found- Check soft-deleted status |

**Input Validation** (All fields optional):

```tsx
{
  title: string (optional, 2-100 chars, unique),
  icon: string (optional, max 500 chars)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialty updated successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "icon": "🫀",
    "createdAt": "2026-01-29T10:00:00Z",
    "updatedAt": "2026-01-29T12:00:00Z"
  }
}
```

---

### FR-SPECIALTY-003: Get Specialty List

**Priority**: MEDIUM

**User Story**: As a user, I want to view all medical specialties so that I can find doctors by specialty.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-003.1 | System must return all specialties | - List all active specialties- Exclude soft-deleted- No authentication required (public endpoint) |
| FR-SPECIALTY-003.2 | System must include doctor count | - Count active doctors per specialty- Use DoctorSpecialty junction table- Exclude deleted doctors |
| FR-SPECIALTY-003.3 | System must support pagination | - Default: page=1, limit=20- Support page and limit params- Return total count |
| FR-SPECIALTY-003.4 | System must support search | - Search by specialty title- Case-insensitive search- Partial match support |
| FR-SPECIALTY-003.5 | System must implement caching | - Cache specialty list (TTL: 1 hour)- Invalidate on create/update/delete- Reduce database load |

**Query Parameters**:

```tsx
{
  page: number (default: 1, min: 1),
  limit: number (default: 20, max: 100),
  searchTerm: string (optional, search title)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialties retrieved successfully",
  "data": [
    {
      "id": "specialty-uuid",
      "title": "Cardiology",
      "icon": "❤️",
      "doctorCount": 15,
      "createdAt": "2026-01-29T10:00:00Z"
    },
    {
      "id": "specialty-uuid-2",
      "title": "Neurology",
      "icon": "🧠",
      "doctorCount": 8,
      "createdAt": "2026-01-29T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

---

### FR-SPECIALTY-004: Delete Specialty

**Priority**: LOW

**User Story**: As an admin, I want to soft-delete unused specialties so that specialty list remains relevant.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-004.1 | System must soft-delete specialty | - Set isDeleted = true- Preserve data (not permanent delete)- Update timestamp |
| FR-SPECIALTY-004.2 | System must check dependencies | - Cannot delete if doctors assigned- Must reassign doctors first- Return appropriate error |
| FR-SPECIALTY-004.3 | System must enforce authorization | - Only SUPER_ADMIN can delete- Return 403 for other roles |
| FR-SPECIALTY-004.4 | System must invalidate cache | - Clear specialty cache- Clear doctor cache (affected doctors)- Ensure consistency |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialty deleted successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "isDeleted": true
  }
}
```

**Error Scenarios**:

- Specialty has assigned doctors → HTTP 409 Conflict
- Specialty not found → HTTP 404 Not Found
- Unauthorized → HTTP 403 Forbidden

**Business Rules**:

- Cannot delete specialty with active doctors (must reassign first)
- Deleted specialties hidden from public list
- Super admin can restore deleted specialties
- Minimum 5 specialties must exist in system

---

### 2.5 Schedule Management

### FR-SCHEDULE-001: Create Doctor Schedule

**Priority**: HIGH

**User Story**: As a doctor, I want to create my availability schedule so that patients can book appointments.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-001.1 | System must create schedule | - Accept date, start time, end time- Link to doctor via DoctorSchedule junction- Generate unique schedule ID- Store in Schedule table |
| FR-SCHEDULE-001.2 | System must validate schedule data | - Date: future or today- Start time: HH:mm format- End time: after start time- Duration: min 30 min, max 12 hours |
| FR-SCHEDULE-001.3 | System must prevent overlaps | - Check existing schedules for doctor- No time overlap allowed- Same date conflict detection- Return 409 if overlap found |
| FR-SCHEDULE-001.4 | System must enforce authorization | - Doctor can create own schedule- Admin can create for any doctor- Return 403 for unauthorized access |
| FR-SCHEDULE-001.5 | System must handle bulk creation | - Support creating multiple time slots- Atomic transaction (all or nothing)- Rollback on any failure |

**Input Validation**:

```tsx
{
  scheduleDate: string (required, ISO date, today or future),
  startTime: string (required, HH:mm format),
  endTime: string (required, HH:mm format, after startTime)
}
```

**Bulk Creation**:

```tsx
{
  schedules: [
    {
      scheduleDate: "2026-02-01",
      startTime: "09:00",
      endTime: "12:00",
    },
    {
      scheduleDate: "2026-02-01",
      startTime: "14:00",
      endTime: "17:00",
    },
  ];
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "id": "schedule-uuid",
    "doctorId": "doctor-uuid",
    "scheduleDate": "2026-02-01",
    "startTime": "09:00",
    "endTime": "12:00",
    "isBooked": false,
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

**Error Scenarios**:

- Time overlap → HTTP 409 Conflict
- Past date → HTTP 400 Bad Request
- Invalid time format → HTTP 400 Bad Request
- Unauthorized → HTTP 403 Forbidden

---

### FR-SCHEDULE-002: Get Doctor Schedule

**Priority**: HIGH

**User Story**: As a patient, I want to view doctor availability so that I can book an appointment.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-002.1 | System must return doctor schedules | - Filter by doctor ID- Filter by date range- Show only available (not booked) slots- Sort by date and time ascending |
| FR-SCHEDULE-002.2 | System must support date filtering | - Filter by specific date- Filter by date range (start/end)- Default: next 7 days- Exclude past dates |
| FR-SCHEDULE-002.3 | System must show booking status | - isBooked flag for each slot- Hide fully booked slots by default- Option to show all (for doctor/admin) |
| FR-SCHEDULE-002.4 | System must implement caching | - Cache schedules per doctor (TTL: 5 min)- Invalidate on schedule changes- Invalidate on booking |
| FR-SCHEDULE-002.5 | System must include doctor info | - Include doctor name, specialty- Include appointment fee- Public endpoint (no auth for viewing) |

**Query Parameters**:

```tsx
{
  doctorId: string (required),
  startDate: string (optional, ISO date, default: today),
  endDate: string (optional, ISO date, default: today + 7 days),
  showBooked: boolean (optional, default: false)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor schedules retrieved successfully",
  "data": {
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "appointmentFee": 500
    },
    "schedules": [
      {
        "id": "schedule-uuid",
        "scheduleDate": "2026-02-01",
        "startTime": "09:00",
        "endTime": "12:00",
        "isBooked": false
      },
      {
        "id": "schedule-uuid-2",
        "scheduleDate": "2026-02-01",
        "startTime": "14:00",
        "endTime": "17:00",
        "isBooked": false
      }
    ]
  }
}
```

---

### FR-SCHEDULE-003: Update Doctor Schedule

**Priority**: MEDIUM

**User Story**: As a doctor, I want to modify my schedule so that I can adjust my availability.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-003.1 | System must update schedule | - Update date, start time, or end time- Partial update supported- Preserve other fields |
| FR-SCHEDULE-003.2 | System must validate constraints | - Cannot update if already booked- Must maintain time logic (end > start)- No overlap with other schedules |
| FR-SCHEDULE-003.3 | System must enforce authorization | - Doctor can update own schedule- Admin can update any schedule- Return 403 for unauthorized |
| FR-SCHEDULE-003.4 | System must invalidate cache | - Clear doctor schedule cache- Clear appointment cache if linked- Update in real-time |

**Input Validation** (All fields optional):

```tsx
{
  scheduleDate: string (optional, ISO date, today or future),
  startTime: string (optional, HH:mm format),
  endTime: string (optional, HH:mm format, after startTime)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "id": "schedule-uuid",
    "doctorId": "doctor-uuid",
    "scheduleDate": "2026-02-01",
    "startTime": "10:00",
    "endTime": "13:00",
    "isBooked": false,
    "updatedAt": "2026-01-29T11:00:00Z"
  }
}
```

**Error Scenarios**:

- Schedule already booked → HTTP 409 Conflict
- Time overlap → HTTP 409 Conflict
- Schedule not found → HTTP 404 Not Found

---

### FR-SCHEDULE-004: Delete Doctor Schedule

**Priority**: MEDIUM

**User Story**: As a doctor, I want to delete my schedule slots so that I can remove unavailable times.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-004.1 | System must soft-delete schedule | - Set isDeleted = true- Cannot delete if booked- Preserve for audit trail |
| FR-SCHEDULE-004.2 | System must check booking status | - Return 409 if schedule has appointment- Must cancel appointment first- Clear error message |
| FR-SCHEDULE-004.3 | System must enforce authorization | - Doctor can delete own schedule- Admin can delete any schedule- Return 403 for unauthorized |
| FR-SCHEDULE-004.4 | System must invalidate cache | - Clear doctor schedule cache- Update availability count- Real-time update |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Schedule deleted successfully",
  "data": {
    "id": "schedule-uuid",
    "isDeleted": true
  }
}
```

**Error Scenarios**:

- Schedule has booking → HTTP 409 Conflict
- Schedule not found → HTTP 404 Not Found
- Unauthorized → HTTP 403 Forbidden

**Business Rules**:

- Cannot delete schedule within 24 hours of start time if booked
- Cannot delete past schedules (archive only)
- Doctors must have at least one schedule per week (warning if none)
- Maximum 10 schedules per day per doctor
- Schedule slots automatically marked unavailable after end time

---

## 3. Appointment Management Module

### 3.1 Core Appointment Operations

### FR-APPOINTMENT-001: Create Appointment (Book Appointment)

**Priority**: CRITICAL

**User Story**: As a patient, I want to book an appointment with a doctor so that I can receive medical consultation.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-001.1 | System must create appointment | - Link patient, doctor, and schedule- Generate unique appointment ID- Set initial status to SCHEDULED- Store in Appointment table |
| FR-APPOINTMENT-001.2 | System must validate booking constraints | - Schedule must exist and be available- Schedule not already booked- Patient cannot double-book same time slot- Doctor must be active (not deleted/blocked) |
| FR-APPOINTMENT-001.3 | System must mark schedule as booked | - Update Schedule.isBooked = true- Atomic transaction with appointment creation- Prevent race conditions (use DB locking) |
| FR-APPOINTMENT-001.4 | System must initiate payment | - Calculate appointment fee from doctor- Create Payment record with status PENDING- Link payment to appointment- Return payment initiation data |
| FR-APPOINTMENT-001.5 | System must enforce authorization | - Only authenticated patients can book- Patient can only book for themselves- Admin can book for any patient |
| FR-APPOINTMENT-001.6 | System must send notifications | - Email confirmation to patient- Email notification to doctor- Include appointment details- Include payment link |
| FR-APPOINTMENT-001.7 | System must handle video call link | - Generate unique video call URL- Store in videoCallingId field- Send to both patient and doctor- Available 15 min before appointment |

**Input Validation**:

```tsx
{
  doctorId: string (required, valid UUID),
  scheduleId: string (required, valid UUID),
  patientId: string (required, valid UUID),
  notes: string (optional, max 1000 chars, patient notes)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointment": {
      "id": "appointment-uuid",
      "patientId": "patient-uuid",
      "doctorId": "doctor-uuid",
      "scheduleId": "schedule-uuid",
      "status": "SCHEDULED",
      "videoCallingId": "meeting-id-xyz",
      "createdAt": "2026-01-29T10:00:00Z"
    },
    "payment": {
      "id": "payment-uuid",
      "appointmentId": "appointment-uuid",
      "amount": 500,
      "status": "PENDING",
      "paymentLink": "https://payment-gateway.com/pay/xyz"
    },
    "schedule": {
      "scheduleDate": "2026-02-01",
      "startTime": "09:00",
      "endTime": "12:00"
    }
  }
}
```

**Error Scenarios**:

- Schedule already booked → HTTP 409 Conflict
- Schedule not found → HTTP 404 Not Found
- Doctor inactive/deleted → HTTP 400 Bad Request
- Patient double-booking → HTTP 409 Conflict
- Past date/time → HTTP 400 Bad Request

**Business Logic**:

1. Validate schedule availability
2. Check patient doesn’t have overlapping appointment
3. Create appointment record (status: SCHEDULED)
4. Mark schedule as booked
5. Create payment record (status: PENDING)
6. Generate video call link
7. Send notification emails
8. Commit transaction or rollback all

---

### FR-APPOINTMENT-002: Get Patient Appointments

**Priority**: HIGH

**User Story**: As a patient, I want to view my appointments so that I can track my upcoming and past consultations.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-002.1 | System must return patient appointments | - Filter by patient ID- Include doctor details- Include schedule details- Include payment status |
| FR-APPOINTMENT-002.2 | System must support status filtering | - Filter by status (SCHEDULED, COMPLETED, CANCELLED)- Default: all statuses- Multiple status selection |
| FR-APPOINTMENT-002.3 | System must support date filtering | - Filter by date range- Filter upcoming appointments- Filter past appointments- Default: all dates |
| FR-APPOINTMENT-002.4 | System must implement pagination | - Default: page=1, limit=10- Sort by appointment date DESC- Include total count |
| FR-APPOINTMENT-002.5 | System must enforce authorization | - Patient can view own appointments only- Admin can view all appointments- Doctor can view their appointments |

**Query Parameters**:

```tsx
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'INPROGRESS' (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  upcoming: boolean (optional, future appointments only)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "id": "appointment-uuid",
      "status": "SCHEDULED",
      "videoCallingId": "meeting-id-xyz",
      "createdAt": "2026-01-29T10:00:00Z",
      "doctor": {
        "id": "doctor-uuid",
        "name": "Dr. John Smith",
        "specialty": "Cardiology",
        "profilePhoto": "https://example.com/photo.jpg"
      },
      "schedule": {
        "scheduleDate": "2026-02-01",
        "startTime": "09:00",
        "endTime": "12:00"
      },
      "payment": {
        "id": "payment-uuid",
        "amount": 500,
        "status": "PAID"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### FR-APPOINTMENT-003: Get Doctor Appointments

**Priority**: HIGH

**User Story**: As a doctor, I want to view my appointments so that I can manage my patient consultations.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-003.1 | System must return doctor appointments | - Filter by doctor ID- Include patient details- Include schedule details- Include payment status |
| FR-APPOINTMENT-003.2 | System must support filtering | - Filter by status- Filter by date range- Filter by patient name- Filter by payment status |
| FR-APPOINTMENT-003.3 | System must implement pagination | - Default: page=1, limit=20- Sort by appointment date ASC- Group by date |
| FR-APPOINTMENT-003.4 | System must show patient health summary | - Include basic health data- Include allergies (critical info)- Include chronic conditions- Privacy compliant |
| FR-APPOINTMENT-003.5 | System must enforce authorization | - Doctor can view own appointments only- Admin can view all appointments- Patient cannot access doctor view |

**Query Parameters**:

```tsx
{
  page: number (default: 1),
  limit: number (default: 20, max: 100),
  status: AppointmentStatus (optional),
  date: string (optional, specific date),
  patientSearch: string (optional, search patient name)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor appointments retrieved successfully",
  "data": [
    {
      "id": "appointment-uuid",
      "status": "SCHEDULED",
      "videoCallingId": "meeting-id-xyz",
      "patient": {
        "id": "patient-uuid",
        "name": "John Doe",
        "contactNumber": "+1234567890",
        "healthSummary": {
          "bloodGroup": "A_POSITIVE",
          "allergies": "Penicillin",
          "chronicConditions": "None"
        }
      },
      "schedule": {
        "scheduleDate": "2026-02-01",
        "startTime": "09:00",
        "endTime": "12:00"
      },
      "payment": {
        "status": "PAID",
        "amount": 500
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### FR-APPOINTMENT-004: Update Appointment Status

**Priority**: HIGH

**User Story**: As a doctor/patient, I want to update appointment status so that appointment lifecycle is tracked.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-004.1 | System must update appointment status | - Accept new status- Validate status transition- Update timestamp- Log status change |
| FR-APPOINTMENT-004.2 | System must validate status transitions | - SCHEDULED → INPROGRESS → COMPLETED- SCHEDULED → CANCELLED- Cannot revert COMPLETED/CANCELLED- Return 400 for invalid transitions |
| FR-APPOINTMENT-004.3 | System must handle cancellation logic | - If cancelled, release schedule (isBooked = false)- Process refund if applicable- Update payment status- Send cancellation notifications |
| FR-APPOINTMENT-004.4 | System must enforce authorization | - Patient can cancel only SCHEDULED status- Doctor can update to INPROGRESS/COMPLETED- Admin can update any status |
| FR-APPOINTMENT-004.5 | System must enforce time constraints | - Cannot start appointment >15 min before schedule- Cannot complete without INPROGRESS status- Auto-complete after 24 hours if INPROGRESS |

**Input Validation**:

```tsx
{
  status: "SCHEDULED" | "INPROGRESS" | "COMPLETED" | "CANCELLED"(required);
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "id": "appointment-uuid",
    "status": "COMPLETED",
    "updatedAt": "2026-02-01T12:30:00Z"
  }
}
```

**Status Transition Rules**:

```
SCHEDULED → INPROGRESS (doctor only, within 15 min window)
INPROGRESS → COMPLETED (doctor only, after consultation)
SCHEDULED → CANCELLED (patient/doctor/admin, before start time)
```

**Error Scenarios**:

- Invalid status transition → HTTP 400 Bad Request
- Too early to start → HTTP 400 Bad Request
- Already completed/cancelled → HTTP 409 Conflict
- Unauthorized role → HTTP 403 Forbidden

---

### FR-APPOINTMENT-005: Cancel Appointment

**Priority**: HIGH

**User Story**: As a patient/doctor, I want to cancel an appointment so that I can manage schedule changes.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-005.1 | System must cancel appointment | - Update status to CANCELLED- Release schedule slot- Process refund logic- Send notifications |
| FR-APPOINTMENT-005.2 | System must enforce cancellation policy | - Patient: can cancel up to 24 hours before- Doctor: can cancel up to 12 hours before- Admin: can cancel anytime- Apply cancellation fees based on timing |
| FR-APPOINTMENT-005.3 | System must handle payment refund | - Full refund if >24 hours before- 50% refund if 12-24 hours before- No refund if <12 hours before- Update payment status to REFUNDED/PARTIAL_REFUND |
| FR-APPOINTMENT-005.4 | System must release schedule | - Set Schedule.isBooked = false- Make slot available for rebooking- Atomic transaction |
| FR-APPOINTMENT-005.5 | System must send notifications | - Email to patient (refund info)- Email to doctor- Include cancellation reason if provided |
| FR-APPOINTMENT-005.6 | System must log cancellation | - Record who cancelled (patient/doctor/admin)- Record cancellation time- Record cancellation reason- Audit trail for disputes |

**Input Validation**:

```tsx
{
  reason: string (optional, max 500 chars, cancellation reason)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "appointment-uuid",
    "status": "CANCELLED",
    "refund": {
      "type": "FULL",
      "amount": 500,
      "processedAt": "2026-01-29T10:00:00Z"
    },
    "cancelledBy": "patient-uuid",
    "cancelledAt": "2026-01-29T10:00:00Z"
  }
}
```

**Cancellation Policy**:

```
>24 hours before: 100% refund
12-24 hours before: 50% refund
<12 hours before: No refund (emergency only)
No-show: No refund
```

**Error Scenarios**:

- Appointment already started (INPROGRESS) → HTTP 409 Conflict
- Appointment already completed → HTTP 409 Conflict
- Within no-cancellation window → HTTP 400 Bad Request (with policy info)

---

### FR-APPOINTMENT-006: Get Appointment by ID

**Priority**: MEDIUM

**User Story**: As a user, I want to view detailed appointment information so that I can access all related data.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-006.1 | System must return complete appointment | - All appointment fields- Patient details- Doctor details- Schedule details- Payment details |
| FR-APPOINTMENT-006.2 | System must include related records | - Include prescription if exists- Include review if exists- Include patient health data (for doctor)- Exclude sensitive data based on role |
| FR-APPOINTMENT-006.3 | System must enforce authorization | - Patient can view own appointments- Doctor can view assigned appointments- Admin can view all- Return 403 for unauthorized |
| FR-APPOINTMENT-006.4 | System must provide video call info | - Video call link (if appointment today)- Link active 15 min before start- Link expires 1 hour after end- Security token included |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointment retrieved successfully",
  "data": {
    "id": "appointment-uuid",
    "status": "SCHEDULED",
    "videoCallingId": "meeting-id-xyz",
    "videoCallLink": "https://video.example.com/meeting-id-xyz?token=xyz",
    "createdAt": "2026-01-29T10:00:00Z",
    "patient": {
      "id": "patient-uuid",
      "name": "John Doe",
      "contactNumber": "+1234567890"
    },
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "appointmentFee": 500
    },
    "schedule": {
      "scheduleDate": "2026-02-01",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    "payment": {
      "id": "payment-uuid",
      "amount": 500,
      "status": "PAID",
      "transactionId": "txn_xyz",
      "paidAt": "2026-01-29T10:05:00Z"
    },
    "prescription": null,
    "review": null
  }
}
```

**Error Scenarios**:

- Appointment not found → HTTP 404 Not Found
- Unauthorized access → HTTP 403 Forbidden

---

### 3.2 Appointment Search & Analytics

### FR-APPOINTMENT-007: Search Appointments (Admin)

**Priority**: MEDIUM

**User Story**: As an admin, I want to search all appointments so that I can monitor system activity.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-007.1 | System must support comprehensive search | - Search by patient name/email- Search by doctor name- Filter by status- Filter by date range |
| FR-APPOINTMENT-007.2 | System must support advanced filtering | - Filter by payment status- Filter by specialty- Filter by appointment fee range- Combine multiple filters |
| FR-APPOINTMENT-007.3 | System must implement pagination | - Default: page=1, limit=20- Sort by multiple fields- Include total count |
| FR-APPOINTMENT-007.4 | System must include analytics | - Total appointments count- Status breakdown- Revenue statistics- Popular specialties |
| FR-APPOINTMENT-007.5 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access- Return 403 for other roles |

**Query Parameters**:

```tsx
{
  page: number (default: 1),
  limit: number (default: 20, max: 100),
  patientSearch: string (optional),
  doctorSearch: string (optional),
  status: AppointmentStatus (optional),
  paymentStatus: PaymentStatus (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  specialty: string (optional),
  minFee: number (optional),
  maxFee: number (optional),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [...],
  "analytics": {
    "totalAppointments": 1250,
    "statusBreakdown": {
      "SCHEDULED": 450,
      "COMPLETED": 650,
      "CANCELLED": 150
    },
    "totalRevenue": 625000,
    "averageFee": 500
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

---

**Business Rules (Appointment Module)**:

- Patient cannot book more than 5 appointments per month
- Appointments auto-cancelled if payment not completed within 30 minutes
- Video call links expire 1 hour after appointment end time
- Doctor can see patient health data only for their appointments
- Appointment slots released immediately upon cancellation
- No-show appointments (not cancelled, not attended) marked COMPLETED after 24 hours
- Patients cannot book same doctor within 7 days (spam prevention)
- Emergency appointments bypass normal booking rules (admin only)

---

## 4. Payment Management Module (Stripe Integration)

### 4.1 Payment Processing

### FR-PAYMENT-001: Initiate Payment

**Priority**: CRITICAL

**User Story**: As a patient, I want to pay for my appointment so that my booking is confirmed.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-001.1 | System must create payment record | - Create Payment entry when appointment booked- Link to appointment (appointmentId)- Set status to PENDING- Store amount from doctor fee |
| FR-PAYMENT-001.2 | System must integrate with Stripe | - Create Stripe Payment Intent- Use Stripe API v2023+- Handle currency (USD default)- Return client secret for frontend |
| FR-PAYMENT-001.3 | System must generate payment link | - Create checkout session URL- Include appointment details- Set success/cancel redirect URLs- Include metadata (appointmentId, patientId) |
| FR-PAYMENT-001.4 | System must set payment expiry | - Payment valid for 30 minutes- Auto-cancel appointment if expired- Release schedule slot- Send expiry notification |
| FR-PAYMENT-001.5 | System must enforce security | - Validate payment amount matches appointment- Prevent amount tampering- Use idempotency keys- Log all payment attempts |

**Input** (Internal - called during appointment creation):

```tsx
{
  appointmentId: string (required, valid UUID),
  amount: number (required, from doctor.appointmentFee),
  currency: string (default: 'USD')
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "payment-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 500,
    "currency": "USD",
    "status": "PENDING",
    "stripePaymentIntentId": "pi_xxx",
    "clientSecret": "pi_xxx_secret_yyy",
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_xxx",
    "expiresAt": "2026-01-29T10:30:00Z"
  }
}
```

**Business Logic**:

1. Create Payment record (status: PENDING)
2. Create Stripe Payment Intent
3. Store Stripe payment intent ID
4. Return payment data to frontend
5. Start 30-minute expiry timer
6. Listen for Stripe webhook events

---

### FR-PAYMENT-002: Process Payment Webhook

**Priority**: CRITICAL

**User Story**: As the system, I want to process Stripe webhook events so that payment status is updated in real-time.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-002.1 | System must verify webhook signature | - Validate Stripe signature- Use webhook secret from env- Reject invalid signatures- Prevent replay attacks |
| FR-PAYMENT-002.2 | System must handle payment success event | - Event: payment_intent.succeeded- Update Payment status to PAID- Store transaction ID- Record payment timestamp |
| FR-PAYMENT-002.3 | System must confirm appointment | - Update appointment status if needed- Send confirmation email- Activate video call link- Send SMS notification (optional) |
| FR-PAYMENT-002.4 | System must handle payment failure | - Event: payment_intent.payment_failed- Update Payment status to FAILED- Cancel appointment- Release schedule slot- Notify patient |
| FR-PAYMENT-002.5 | System must handle idempotency | - Check if event already processed- Store processed event IDs- Prevent duplicate processing- Return 200 for duplicates |
| FR-PAYMENT-002.6 | System must log webhook events | - Log all webhook calls- Store event type and data- Audit trail for disputes- Debug failed transactions |

**Webhook Events Handled**:

```tsx
{
  'payment_intent.succeeded': handlePaymentSuccess,
  'payment_intent.payment_failed': handlePaymentFailure,
  'payment_intent.canceled': handlePaymentCancellation,
  'charge.refunded': handleRefund
}
```

**Webhook Payload** (from Stripe):

```json
{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 50000,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "appointmentId": "appointment-uuid",
        "patientId": "patient-uuid"
      }
    }
  }
}
```

**Success Response**: HTTP 200 OK

```json
{
  "received": true
}
```

**Error Scenarios**:

- Invalid signature → HTTP 400 Bad Request
- Unhandled event type → HTTP 200 OK (logged)
- Payment record not found → HTTP 404 Not Found (logged, alert admin)

---

### FR-PAYMENT-003: Process Refund

**Priority**: HIGH

**User Story**: As a patient, I want to receive refund when appointment is cancelled so that I get my money back.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-003.1 | System must calculate refund amount | - Apply cancellation policy- Full refund: >24 hours before- Partial refund: 12-24 hours before- No refund: <12 hours before |
| FR-PAYMENT-003.2 | System must process Stripe refund | - Create Stripe refund- Specify refund amount- Include refund reason- Store refund ID |
| FR-PAYMENT-003.3 | System must update payment record | - Update status to REFUNDED or PARTIAL_REFUND- Store refund amount- Store refund timestamp- Link to Stripe refund ID |
| FR-PAYMENT-003.4 | System must handle refund webhook | - Event: charge.refunded- Confirm refund processed- Update local records- Send confirmation email |
| FR-PAYMENT-003.5 | System must enforce refund rules | - Can only refund PAID payments- Cannot refund already refunded- Cannot exceed original amount- Validate appointment cancellation |

**Input** (Internal - called during cancellation):

```tsx
{
  paymentId: string (required, valid UUID),
  refundType: 'FULL' | 'PARTIAL' (required),
  reason: string (optional, cancellation reason)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "paymentId": "payment-uuid",
    "originalAmount": 500,
    "refundAmount": 500,
    "refundType": "FULL",
    "status": "REFUNDED",
    "stripeRefundId": "re_xxx",
    "refundedAt": "2026-01-29T10:00:00Z",
    "estimatedArrival": "2026-02-05T10:00:00Z"
  }
}
```

**Refund Processing Time**:

- Credit cards: 5-10 business days
- Debit cards: 5-10 business days
- Varies by bank/country

**Error Scenarios**:

- Payment not in PAID status → HTTP 400 Bad Request
- Already refunded → HTTP 409 Conflict
- Stripe refund failed → HTTP 500 Internal Server Error (retry logic)

---

### FR-PAYMENT-004: Get Payment Details

**Priority**: MEDIUM

**User Story**: As a patient/admin, I want to view payment details so that I can track transaction history.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-004.1 | System must return payment details | - All payment fields- Appointment reference- Stripe transaction IDs- Payment timeline |
| FR-PAYMENT-004.2 | System must include transaction history | - Payment attempts- Status changes- Refund history- Timestamps |
| FR-PAYMENT-004.3 | System must enforce authorization | - Patient can view own payments- Doctor can view their appointment payments- Admin can view all payments |
| FR-PAYMENT-004.4 | System must mask sensitive data | - Mask card details (if stored)- Show last 4 digits only- Hide full transaction IDs from patient- Admin sees full details |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "id": "payment-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 500,
    "currency": "USD",
    "status": "PAID",
    "paymentMethod": "card",
    "cardLast4": "4242",
    "stripePaymentIntentId": "pi_xxx",
    "transactionId": "ch_xxx",
    "createdAt": "2026-01-29T10:00:00Z",
    "paidAt": "2026-01-29T10:05:00Z",
    "refundHistory": []
  }
}
```

---

### FR-PAYMENT-005: Get Payment History

**Priority**: MEDIUM

**User Story**: As a patient, I want to view my payment history so that I can track my medical expenses.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-005.1 | System must return user payment list | - Filter by user (patient/doctor)- Include appointment details- Include doctor/patient info- Paginated results |
| FR-PAYMENT-005.2 | System must support filtering | - Filter by status (PAID, PENDING, REFUNDED)- Filter by date range- Filter by amount range- Search by appointment |
| FR-PAYMENT-005.3 | System must calculate totals | - Total amount paid- Total refunded- Net amount- Tax breakdown (if applicable) |
| FR-PAYMENT-005.4 | System must support export | - Export as PDF (invoice format)- Export as CSV- Include all transactions- Tax-compliant format |

**Query Parameters**:

```tsx
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  status: PaymentStatus (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": [
    {
      "id": "payment-uuid",
      "amount": 500,
      "status": "PAID",
      "paidAt": "2026-01-29T10:05:00Z",
      "appointment": {
        "id": "appointment-uuid",
        "scheduleDate": "2026-02-01",
        "doctor": {
          "name": "Dr. John Smith",
          "specialty": "Cardiology"
        }
      }
    }
  ],
  "summary": {
    "totalPaid": 2500,
    "totalRefunded": 500,
    "netAmount": 2000,
    "transactionCount": 5
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 4.2 Payment Administration

### FR-PAYMENT-006: Admin Payment Dashboard

**Priority**: MEDIUM

**User Story**: As an admin, I want to view payment analytics so that I can monitor revenue and transactions.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-006.1 | System must provide payment analytics | - Total revenue (all time, monthly, daily)- Payment status breakdown- Refund statistics- Average transaction value |
| FR-PAYMENT-006.2 | System must show payment trends | - Revenue over time (chart data)- Successful payment rate- Failed payment analysis- Refund rate |
| FR-PAYMENT-006.3 | System must list recent transactions | - Last 50 transactions- Filter by status- Search by patient/doctor- Export capability |
| FR-PAYMENT-006.4 | System must handle manual actions | - Manual refund processing- Resolve failed payments- Update payment status (admin override)- Add payment notes |
| FR-PAYMENT-006.5 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access- Log all admin actions- Audit trail for financial compliance |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRevenue": 125000,
      "monthlyRevenue": 25000,
      "todayRevenue": 2500,
      "totalTransactions": 250,
      "successRate": 95.5,
      "refundRate": 8.2
    },
    "statusBreakdown": {
      "PAID": 220,
      "PENDING": 15,
      "FAILED": 10,
      "REFUNDED": 5
    },
    "recentTransactions": [
      {
        "id": "payment-uuid",
        "amount": 500,
        "status": "PAID",
        "patient": "John Doe",
        "doctor": "Dr. Smith",
        "paidAt": "2026-01-29T10:05:00Z"
      }
    ]
  }
}
```

---

### FR-PAYMENT-007: Generate Invoice

**Priority**: MEDIUM

**User Story**: As a patient, I want to download invoice for my payment so that I can claim insurance reimbursement.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-007.1 | System must generate PDF invoice | - Professional invoice format- Include company details- Include patient details- Include itemized charges |
| FR-PAYMENT-007.2 | System must include required information | - Invoice number (unique)- Date of service- Doctor information- Payment details- Tax information (if applicable) |
| FR-PAYMENT-007.3 | System must support tax compliance | - Tax ID/GST number- Tax breakdown- Compliant with local regulations- Audit-ready format |
| FR-PAYMENT-007.4 | System must store invoice history | - Archive generated invoices- Re-download capability- Version tracking- 7-year retention |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceNumber": "INV-2026-00123",
    "invoiceDate": "2026-01-29",
    "invoiceUrl": "https://s3.amazonaws.com/invoices/INV-2026-00123.pdf",
    "downloadUrl": "https://signed-url-expires-in-24hr"
  }
}
```

**Invoice Contents**:

- Header: Company name, logo, contact info
- Invoice number and date
- Patient details (name, email)
- Service details (appointment with Dr. X)
- Amount breakdown
- Payment method
- Tax details (if applicable)
- Footer: Thank you message, terms & conditions

---

**Business Rules (Payment Module)**:

- All payments processed through Stripe (PCI DSS compliant)
- Payment expires 30 minutes after appointment creation
- Refund processing time: 5-10 business days
- Failed payments trigger automatic appointment cancellation
- Maximum 3 payment retry attempts allowed
- Payments cannot be processed for cancelled appointments
- Admin can manually mark payment as completed (with justification)
- Invoice automatically generated upon successful payment
- Payment records retained indefinitely (financial compliance)
- Stripe webhook events must be processed within 5 seconds

---

## 5. Prescription Management Module

### 5.1 Prescription Operations

### FR-PRESCRIPTION-001: Create Prescription

**Priority**: HIGH

**User Story**: As a doctor, I want to create prescriptions for patients so that they can receive proper medication.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-001.1 | System must create prescription | - Link to appointment (appointmentId)- Accept instructions and followup date- Generate unique prescription ID- Store in Prescription table |
| FR-PRESCRIPTION-001.2 | System must validate prescription data | - Appointment must exist and be COMPLETED- Doctor must be appointment’s doctor- Instructions required (min 10 chars)- Follow-up date optional (future date) |
| FR-PRESCRIPTION-001.3 | System must prevent duplicates | - One prescription per appointment- Return 409 if prescription exists- Allow prescription updates instead |
| FR-PRESCRIPTION-001.4 | System must enforce authorization | - Only assigned doctor can create- Appointment must be in COMPLETED status- Return 403 for unauthorized |
| FR-PRESCRIPTION-001.5 | System must send notifications | - Email prescription to patient- Include PDF attachment- Include follow-up date- Doctor copy for records |

**Input Validation**:

```tsx
{
  appointmentId: string (required, valid UUID),
  instructions: string (required, min 10 chars, max 5000 chars),
  followUpDate: string (optional, ISO date, future date)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "id": "prescription-uuid",
    "appointmentId": "appointment-uuid",
    "doctorId": "doctor-uuid",
    "patientId": "patient-uuid",
    "instructions": "Take medication as prescribed...",
    "followUpDate": "2026-02-15",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

**Error Scenarios**:

- Appointment not completed → HTTP 400 Bad Request
- Prescription already exists → HTTP 409 Conflict
- Unauthorized doctor → HTTP 403 Forbidden
- Appointment not found → HTTP 404 Not Found

---

### FR-PRESCRIPTION-002: Update Prescription

**Priority**: MEDIUM

**User Story**: As a doctor, I want to update prescription instructions so that I can correct or add information.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-002.1 | System must update prescription | - Update instructions and/or followUpDate- Partial update supported- Preserve other fields- Update timestamp |
| FR-PRESCRIPTION-002.2 | System must validate update data | - Instructions validation if provided- Follow-up date validation if provided- Cannot change appointment link |
| FR-PRESCRIPTION-002.3 | System must maintain version history | - Log all prescription changes- Store previous versions- Audit trail for medical records- Compliance requirement |
| FR-PRESCRIPTION-002.4 | System must enforce authorization | - Only original doctor can update- Within 30 days of creation- Admin can override with reason |
| FR-PRESCRIPTION-002.5 | System must notify patient | - Email updated prescription- Highlight changes- New PDF generated- Version number included |

**Input Validation** (All fields optional):

```tsx
{
  instructions: string (optional, min 10 chars, max 5000 chars),
  followUpDate: string (optional, ISO date, future date)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription updated successfully",
  "data": {
    "id": "prescription-uuid",
    "instructions": "Updated medication instructions...",
    "followUpDate": "2026-02-20",
    "version": 2,
    "updatedAt": "2026-01-29T12:00:00Z"
  }
}
```

---

### FR-PRESCRIPTION-003: Get Prescription by ID

**Priority**: MEDIUM

**User Story**: As a patient/doctor, I want to view prescription details so that I can access medical instructions.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-003.1 | System must return complete prescription | - All prescription fields- Doctor details- Patient details- Appointment details- PDF download link |
| FR-PRESCRIPTION-003.2 | System must include related data | - Doctor name, specialty, license number- Patient name, age- Appointment date- Prescription issue date |
| FR-PRESCRIPTION-003.3 | System must enforce authorization | - Patient can view own prescriptions- Doctor can view prescriptions they issued- Admin can view all- Return 403 for unauthorized |
| FR-PRESCRIPTION-003.4 | System must generate PDF on demand | - Professional prescription format- Include doctor signature (digital)- Include hospital/clinic details- Watermark for authenticity |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription retrieved successfully",
  "data": {
    "id": "prescription-uuid",
    "instructions": "Medication instructions...",
    "followUpDate": "2026-02-15",
    "createdAt": "2026-01-29T10:00:00Z",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "licenseNumber": "MED12345"
    },
    "patient": {
      "id": "patient-uuid",
      "name": "John Doe",
      "age": 35
    },
    "appointment": {
      "id": "appointment-uuid",
      "scheduleDate": "2026-02-01",
      "startTime": "09:00"
    },
    "pdfUrl": "https://signed-url-expires-in-24hr"
  }
}
```

---

### FR-PRESCRIPTION-004: Get Patient Prescriptions

**Priority**: MEDIUM

**User Story**: As a patient, I want to view all my prescriptions so that I can track my medication history.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-004.1 | System must return patient prescriptions | - Filter by patient ID- Include doctor details- Include appointment details- Paginated results |
| FR-PRESCRIPTION-004.2 | System must support sorting | - Sort by creation date (default: DESC)- Sort by follow-up date- Sort by doctor name |
| FR-PRESCRIPTION-004.3 | System must support filtering | - Filter by date range- Filter by doctor- Filter by specialty- Search in instructions |
| FR-PRESCRIPTION-004.4 | System must implement pagination | - Default: page=1, limit=10- Include total count- Return prescription summaries |
| FR-PRESCRIPTION-004.5 | System must enforce authorization | - Patient can view own prescriptions- Doctor can view their issued prescriptions- Admin can view all |

**Query Parameters**:

```tsx
{
  page: number (default: 1),
  limit: number (default: 10, max: 50),
  doctorId: string (optional, filter by doctor),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescriptions retrieved successfully",
  "data": [
    {
      "id": "prescription-uuid",
      "instructions": "Medication instructions...",
      "followUpDate": "2026-02-15",
      "createdAt": "2026-01-29T10:00:00Z",
      "doctor": {
        "name": "Dr. John Smith",
        "specialty": "Cardiology"
      },
      "appointment": {
        "scheduleDate": "2026-02-01"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### FR-PRESCRIPTION-005: Generate Prescription PDF

**Priority**: MEDIUM

**User Story**: As a patient, I want to download my prescription as PDF so that I can present it at pharmacy.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-005.1 | System must generate professional PDF | - Standard prescription format- Include all required information- Proper medical terminology- Print-ready quality |
| FR-PRESCRIPTION-005.2 | System must include mandatory fields | - Doctor name, license number- Patient name, age- Date of prescription- Medication instructions- Follow-up date- Doctor signature (digital) |
| FR-PRESCRIPTION-005.3 | System must add security features | - Unique prescription number- QR code for verification- Watermark (anti-forgery)- Timestamp |
| FR-PRESCRIPTION-005.4 | System must store generated PDFs | - Upload to S3 or cloud storage- Generate signed URL (24-hour expiry)- Cache PDF (regenerate only if updated)- 7-year retention |
| FR-PRESCRIPTION-005.5 | System must enforce authorization | - Patient can download own prescriptions- Doctor can download issued prescriptions- Admin can download all |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription PDF generated successfully",
  "data": {
    "prescriptionId": "prescription-uuid",
    "pdfUrl": "https://s3.amazonaws.com/prescriptions/...",
    "downloadUrl": "https://signed-url-expires-in-24hr",
    "expiresAt": "2026-01-30T10:00:00Z",
    "fileSize": 125000
  }
}
```

**PDF Layout**:

```
┌─────────────────────────────────────────┐
│ HOSPITAL/CLINIC LOGO & NAME             │
│ Address, Phone, Email                   │
├─────────────────────────────────────────┤
│ PRESCRIPTION                            │
│                                         │
│ Prescription No: RX-2026-00123          │
│ Date: January 29, 2026                  │
│                                         │
│ Doctor: Dr. John Smith                  │
│ License: MED12345                       │
│ Specialty: Cardiology                   │
│                                         │
│ Patient: John Doe                       │
│ Age: 35 years                           │
│ Date of Birth: May 15, 1990             │
│                                         │
│ Rx:                                     │
│ [Medication instructions text]          │
│                                         │
│ Follow-up: February 15, 2026            │
│                                         │
│ ___________________________             │
│ Dr. John Smith (Digital Signature)      │
│                                         │
│ [QR Code for verification]              │
│ Watermark: VALID PRESCRIPTION           │
└─────────────────────────────────────────┘
```

---

### 5.2 Prescription Analytics

### FR-PRESCRIPTION-006: Get Prescription Statistics (Doctor)

**Priority**: LOW

**User Story**: As a doctor, I want to view my prescription statistics so that I can track my patient care.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-006.1 | System must calculate doctor statistics | - Total prescriptions issued- Prescriptions this month- Average prescriptions per day- Patients prescribed |
| FR-PRESCRIPTION-006.2 | System must provide time-based analysis | - Prescriptions by month (last 12 months)- Prescriptions by day of week- Peak prescription hours |
| FR-PRESCRIPTION-006.3 | System must show follow-up analytics | - Upcoming follow-ups count- Overdue follow-ups- Follow-up compliance rate |
| FR-PRESCRIPTION-006.4 | System must enforce authorization | - Doctor can view own statistics only- Admin can view all doctor statistics |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription statistics retrieved successfully",
  "data": {
    "overview": {
      "totalPrescriptions": 245,
      "thisMonthPrescriptions": 35,
      "averagePerDay": 1.2,
      "uniquePatients": 180
    },
    "trends": {
      "byMonth": [
        { "month": "2025-12", "count": 28 },
        { "month": "2026-01", "count": 35 }
      ]
    },
    "followUps": {
      "upcoming": 15,
      "overdue": 3,
      "complianceRate": 87.5
    }
  }
}
```

---

### FR-PRESCRIPTION-007: Admin Prescription Dashboard

**Priority**: LOW

**User Story**: As an admin, I want to view prescription analytics so that I can monitor system usage.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-007.1 | System must provide overall statistics | - Total prescriptions in system- Prescriptions today/week/month- Growth rate- Top prescribing doctors |
| FR-PRESCRIPTION-007.2 | System must show doctor performance | - Prescriptions per doctor- Average prescription length- Follow-up compliance by doctor |
| FR-PRESCRIPTION-007.3 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access- Return 403 for other roles |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Admin prescription dashboard retrieved successfully",
  "data": {
    "overview": {
      "totalPrescriptions": 5420,
      "todayPrescriptions": 45,
      "weekPrescriptions": 280,
      "monthPrescriptions": 1250,
      "growthRate": 12.5
    },
    "topDoctors": [
      {
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. John Smith",
        "prescriptionCount": 245,
        "specialty": "Cardiology"
      }
    ]
  }
}
```

---

**Business Rules (Prescription Module)**:

- Prescriptions can only be created for COMPLETED appointments
- One prescription per appointment (prevent duplicates)
- Prescriptions can be updated within 30 days by original doctor
- PDF prescriptions include QR code for verification
- Prescription records retained for 7 years (medical compliance)
- Follow-up date must be within 6 months of prescription date
- Patients receive automatic follow-up reminders (7 days before)
- Doctor license number must be verified before prescription creation
- Prescription PDFs watermarked for authenticity
- Admin cannot create prescriptions (only doctors)

---

## 6. Review Management Module

### 6.1 Review Operations

### FR-REVIEW-001: Create Review

**Priority**: MEDIUM

**User Story**: As a patient, I want to review my doctor after appointment so that I can share my experience.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-001.1 | System must create review | - Link to appointment (appointmentId)- Accept rating (1-5) and comment- Generate unique review ID- Store in Review table |
| FR-REVIEW-001.2 | System must validate review constraints | - Appointment must be COMPLETED- Patient must be appointment’s patient- One review per appointment- Rating: integer 1-5 |
| FR-REVIEW-001.3 | System must validate review content | - Rating required (1-5 stars)- Comment optional (max 1000 chars)- Comment sanitized (XSS prevention)- Profanity filter applied |
| FR-REVIEW-001.4 | System must update doctor statistics | - Recalculate average rating- Update total review count- Update doctor profile cache- Real-time rating update |
| FR-REVIEW-001.5 | System must enforce authorization | - Only appointment patient can review- Can review within 30 days of completion- Return 403 for unauthorized |
| FR-REVIEW-001.6 | System must send notifications | - Email notification to doctor- Include rating and comment- Option for doctor to respond |

**Input Validation**:

```tsx
{
  appointmentId: string (required, valid UUID),
  rating: number (required, integer, 1-5),
  comment: string (optional, max 1000 chars)
}
```

**Success Response**: HTTP 201 Created

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "review-uuid",
    "appointmentId": "appointment-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "rating": 5,
    "comment": "Excellent doctor, very caring and professional.",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

**Error Scenarios**:

- Appointment not completed → HTTP 400 Bad Request
- Review already exists → HTTP 409 Conflict
- Review period expired (>30 days) → HTTP 400 Bad Request
- Unauthorized patient → HTTP 403 Forbidden

---

### FR-REVIEW-002: Update Review

**Priority**: LOW

**User Story**: As a patient, I want to edit my review so that I can correct or update my feedback.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-002.1 | System must update review | - Update rating and/or comment- Partial update supported- Preserve other fields- Update timestamp |
| FR-REVIEW-002.2 | System must validate update constraints | - Can update within 7 days of creation- Rating validation if changed- Comment validation if changed |
| FR-REVIEW-002.3 | System must recalculate doctor rating | - Update doctor average rating- Invalidate doctor cache- Real-time update |
| FR-REVIEW-002.4 | System must enforce authorization | - Only review author can update- Within edit time window (7 days)- Admin cannot edit patient reviews |

**Input Validation** (All fields optional):

```tsx
{
  rating: number (optional, integer, 1-5),
  comment: string (optional, max 1000 chars)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "review-uuid",
    "rating": 4,
    "comment": "Updated: Good experience overall.",
    "updatedAt": "2026-01-29T12:00:00Z"
  }
}
```

**Error Scenarios**:

- Edit window expired → HTTP 400 Bad Request
- Review not found → HTTP 404 Not Found
- Unauthorized → HTTP 403 Forbidden

---

### FR-REVIEW-003: Get Doctor Reviews

**Priority**: MEDIUM

**User Story**: As a user, I want to view doctor reviews so that I can choose the right doctor.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-003.1 | System must return doctor reviews | - Filter by doctor ID- Include patient name (anonymized option)- Include rating and comment- Include date |
| FR-REVIEW-003.2 | System must support pagination | - Default: page=1, limit=10- Sort by rating (high/low)- Sort by date (newest/oldest)- Include total count |
| FR-REVIEW-003.3 | System must support filtering | - Filter by rating (e.g., 5-star only)- Filter by date range- Verified reviews only option |
| FR-REVIEW-003.4 | System must include summary statistics | - Average rating- Total reviews- Rating distribution (1-5 stars)- Percentage breakdown |
| FR-REVIEW-003.5 | System must implement anonymization | - Option to hide patient full name- Show only first name + initial- Configurable per patient |
| FR-REVIEW-003.6 | System must be public | - No authentication required- Publicly accessible endpoint- Cache for performance (TTL: 15 min) |

**Query Parameters**:

```tsx
{
  doctorId: string (required),
  page: number (default: 1),
  limit: number (default: 10, max: 50),
  rating: number (optional, filter by specific rating),
  sortBy: 'rating' | 'createdAt' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor reviews retrieved successfully",
  "data": {
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "averageRating": 4.7,
      "totalReviews": 150
    },
    "ratingDistribution": {
      "5": 100,
      "4": 35,
      "3": 10,
      "2": 3,
      "1": 2
    },
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent doctor!",
        "patientName": "John D.",
        "createdAt": "2026-01-29T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

### FR-REVIEW-004: Get Patient Reviews

**Priority**: LOW

**User Story**: As a patient, I want to view my submitted reviews so that I can track my feedback history.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-004.1 | System must return patient reviews | - Filter by patient ID- Include doctor details- Include appointment details- Show edit status |
| FR-REVIEW-004.2 | System must support pagination | - Default: page=1, limit=10- Sort by creation date DESC- Include total count |
| FR-REVIEW-004.3 | System must indicate editability | - Flag if still editable (within 7 days)- Show time remaining for edit- Show last updated timestamp |
| FR-REVIEW-004.4 | System must enforce authorization | - Patient can view own reviews only- Admin can view all reviews |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient reviews retrieved successfully",
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "Great experience!",
      "doctor": {
        "name": "Dr. John Smith",
        "specialty": "Cardiology"
      },
      "appointment": {
        "scheduleDate": "2026-02-01"
      },
      "createdAt": "2026-01-29T10:00:00Z",
      "isEditable": true,
      "editTimeRemaining": "6 days"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

---

### FR-REVIEW-005: Delete Review

**Priority**: LOW

**User Story**: As a patient/admin, I want to delete reviews so that I can remove inappropriate content.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-005.1 | System must soft-delete review | - Set isDeleted = true- Preserve data for audit- Exclude from public listings- Update timestamp |
| FR-REVIEW-005.2 | System must recalculate doctor rating | - Recalculate average without deleted review- Update review count- Invalidate cache- Real-time update |
| FR-REVIEW-005.3 | System must enforce authorization | - Patient can delete own review (within 7 days)- Admin can delete any review (with reason)- Log deletion with reason |
| FR-REVIEW-005.4 | System must send notifications | - Notify doctor of deletion- Notify patient if admin deleted (with reason)- Audit log entry |

**Input** (Admin only):

```tsx
{
  reason: string (required for admin, max 500 chars)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "id": "review-uuid",
    "isDeleted": true,
    "deletedAt": "2026-01-29T12:00:00Z"
  }
}
```

**Error Scenarios**:

- Delete window expired (patient) → HTTP 400 Bad Request
- Review not found → HTTP 404 Not Found
- Unauthorized → HTTP 403 Forbidden

---

### 6.2 Review Analytics

### FR-REVIEW-006: Get Review Statistics

**Priority**: LOW

**User Story**: As an admin, I want to view review statistics so that I can monitor platform quality.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-006.1 | System must provide overall statistics | - Total reviews in system- Reviews today/week/month- Average platform rating- Rating distribution |
| FR-REVIEW-006.2 | System must show trends | - Reviews over time (chart data)- Average rating trends- Growth rate- Top-rated doctors |
| FR-REVIEW-006.3 | System must identify issues | - Low-rated appointments- Flagged reviews (profanity, spam)- Doctors needing attention (<3.5 rating) |
| FR-REVIEW-006.4 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access- Return 403 for other roles |

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Review statistics retrieved successfully",
  "data": {
    "overview": {
      "totalReviews": 5420,
      "todayReviews": 45,
      "weekReviews": 280,
      "monthReviews": 1250,
      "averageRating": 4.6
    },
    "ratingDistribution": {
      "5": 3200,
      "4": 1800,
      "3": 350,
      "2": 50,
      "1": 20
    },
    "trends": {
      "byMonth": [
        { "month": "2025-12", "count": 1100, "avgRating": 4.5 },
        { "month": "2026-01", "count": 1250, "avgRating": 4.6 }
      ]
    },
    "topRatedDoctors": [
      {
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. John Smith",
        "averageRating": 4.9,
        "totalReviews": 150
      }
    ],
    "lowRatedDoctors": [
      {
        "doctorId": "doctor-uuid-2",
        "doctorName": "Dr. Jane Doe",
        "averageRating": 3.2,
        "totalReviews": 45,
        "needsAttention": true
      }
    ]
  }
}
```

---

### FR-REVIEW-007: Doctor Response to Review

**Priority**: LOW

**User Story**: As a doctor, I want to respond to patient reviews so that I can address concerns publicly.

**Requirements**:

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-007.1 | System must store doctor response | - Add response field to Review- Store response text and timestamp- Link to review- One response per review |
| FR-REVIEW-007.2 | System must validate response | - Response max 500 chars- Sanitize input- Professional tone check (optional AI)- Cannot delete once posted |
| FR-REVIEW-007.3 | System must enforce authorization | - Only reviewed doctor can respond- Cannot respond to deleted reviews- Response within 30 days of review |
| FR-REVIEW-007.4 | System must notify patient | - Email patient when doctor responds- Include response text- Link to view full review |

**Input Validation**:

```tsx
{
  response: string (required, max 500 chars)
}
```

**Success Response**: HTTP 200 OK

```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "reviewId": "review-uuid",
    "response": "Thank you for your feedback. I'm glad I could help!",
    "respondedAt": "2026-01-29T15:00:00Z"
  }
}
```

---

**Business Rules (Review Module)**:

- Patients can review only COMPLETED appointments
- One review per appointment (no duplicates)
- Reviews must be submitted within 30 days of appointment completion
- Reviews editable for 7 days after submission
- Patients can delete own reviews within 7 days
- Admin can delete any review with valid reason (logged)
- Minimum 3-star average required for doctor profile visibility
- Doctors automatically hidden if rating drops below 2.5 (requires admin review)
- Review comments max 1000 characters
- Profanity filter applied to all comments
- Anonymous reviews not allowed (verified patients only)
- Doctor responses limited to 500 characters
- Reviews contribute to doctor search ranking
- Incentivize reviews: patients get 5% discount on next appointment if they review

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

### NFR-PERF-001: Response Time

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-PERF-001.1 | API response time | - 95% of requests < 200ms- 99% of requests < 500ms- Database queries optimized- Measured at server level |
| NFR-PERF-001.2 | Database query performance | - Simple queries < 50ms- Complex queries < 200ms- Proper indexing on all foreign keys- Query execution plans reviewed |
| NFR-PERF-001.3 | File upload/download | - Upload: Support up to 10MB files- Download: Serve via CDN- Signed URLs for security- Multipart upload for large files |

### NFR-PERF-002: Caching Strategy

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-PERF-002.1 | Redis caching implementation | - Cache frequently accessed data- TTL: 15 min (doctor list, specialties)- TTL: 5 min (schedules)- TTL: 1 hour (static content) |
| NFR-PERF-002.2 | Cache invalidation | - Invalidate on data update- Invalidate on delete- Tag-based invalidation- Manual purge capability (admin) |
| NFR-PERF-002.3 | Cache hit rate | - Target: >80% cache hit rate- Monitor with Redis metrics- Alert if drops below 70% |

### NFR-PERF-003: Scalability

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-PERF-003.1 | Concurrent users | - Support 10,000 concurrent users- Horizontal scaling capability- Load balancer ready- Stateless API design |
| NFR-PERF-003.2 | Database connection pooling | - Min pool size: 10- Max pool size: 100- Connection timeout: 30s- Idle connection cleanup |
| NFR-PERF-003.3 | Rate limiting | - 100 requests/minute per user- 1000 requests/minute per IP- Sliding window algorithm- Return 429 when exceeded |

---

### 7.2 Security Requirements

### NFR-SEC-001: Authentication & Authorization

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-SEC-001.1 | Password security | - Min 8 chars, 1 uppercase, 1 lowercase, 1 number- Bcrypt hashing (cost factor: 12)- Password history (prevent reuse of last 5)- Max failed attempts: 5 (lockout 30 min) |
| NFR-SEC-001.2 | JWT token security | - Access token expiry: 15 minutes- Refresh token expiry: 7 days- Rotate refresh tokens- Blacklist revoked tokens (Redis) |
| NFR-SEC-001.3 | Session management | - Better Auth session handling- Secure, HttpOnly cookies- SameSite: Strict- CSRF protection enabled |

### NFR-SEC-002: Data Protection

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-SEC-002.1 | Data encryption | - HTTPS/TLS 1.3 only- Database encryption at rest- Environment variables secured- Secrets in AWS Secrets Manager |
| NFR-SEC-002.2 | PII/PHI protection | - Encryption for sensitive fields- Access logging for PHI- Data anonymization for analytics |
| NFR-SEC-002.3 | Input validation | - Zod schema validation- SQL injection prevention (Prisma)- XSS prevention (sanitization)- File upload validation (type, size) |

### NFR-SEC-003: API Security

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-SEC-003.1 | CORS configuration | - Whitelist allowed origins- Credentials support enabled- Preflight caching- Environment-specific origins |
| NFR-SEC-003.2 | API rate limiting | - Per-user rate limits- Per-IP rate limits- DDoS protection- Cloudflare integration |
| NFR-SEC-003.3 | Security headers | - Helmet.js middleware- Content Security Policy- X-Frame-Options: DENY- HSTS enabled |

---

### 7.3 Reliability & Availability

### NFR-REL-001: Uptime

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-REL-001.1 | Service availability | - 99.9% uptime SLA- Maximum 43 minutes downtime/month- Scheduled maintenance windows- Blue-green deployment |
| NFR-REL-001.2 | Database availability | - PostgreSQL replication (master-slave)- Automatic failover- Point-in-time recovery- Daily backups retained 30 days |
| NFR-REL-001.3 | Redis availability | - Redis Cluster or Sentinel- Automatic failover- Persistence enabled (AOF + RDB)- Backup daily |

### NFR-REL-002: Error Handling

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-REL-002.1 | Global error handling | - Centralized error middleware- Proper HTTP status codes- User-friendly error messages- Never expose stack traces |
| NFR-REL-002.2 | Transaction management | - Atomic operations with Prisma- Rollback on failure- Retry logic for transient failures- Idempotency for critical operations |
| NFR-REL-002.3 | Circuit breaker | - Implement for external services (Stripe, email)- Open after 5 consecutive failures- Half-open after 30 seconds- Fallback mechanisms |

### NFR-REL-003: Monitoring & Logging

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-REL-003.1 | Application logging | - Winston for structured logging- Log levels: error, warn, info, debug- Rotate logs daily- Retention: 90 days |
| NFR-REL-003.2 | Error tracking | - Sentry integration- Real-time error alerts- Stack trace capture- User context included |
| NFR-REL-003.3 | Performance monitoring | - APM tool (e.g., New Relic, DataDog)- Response time metrics- Database query monitoring- Memory/CPU usage tracking |
| NFR-REL-003.4 | Audit logging | - Log all CRUD operations- Log authentication events- Log admin actions- Log payment transactions- Immutable audit trail |

---

### 7.4 Maintainability

### NFR-MAIN-001: Code Quality

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-MAIN-001.1 | Code standards | - TypeScript strict mode- ESLint configuration- Prettier formatting- Pre-commit hooks (Husky) |
| NFR-MAIN-001.2 | Code documentation | - JSDoc comments for public APIs- README files for modules- API documentation (Swagger/OpenAPI)- Architecture diagrams |
| NFR-MAIN-001.3 | Code complexity | - Max cyclomatic complexity: 10- Max function length: 50 lines- Max file length: 300 lines- SonarQube analysis |

### NFR-MAIN-002: Testing

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-MAIN-002.1 | Unit testing | - Jest framework- Coverage: >80%- Test all services/utilities- Mock external dependencies |
| NFR-MAIN-002.2 | Integration testing | - Test API endpoints- Test database interactions- Test authentication flows- Coverage: >70% |
| NFR-MAIN-002.3 | E2E testing | - Test critical user flows- Appointment booking flow- Payment flow- Authentication flow |

### NFR-MAIN-003: Deployment

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-MAIN-003.1 | CI/CD pipeline | - GitHub Actions workflow- Automated testing on PR- Automated deployment to staging- Manual approval for production |
| NFR-MAIN-003.2 | Environment management | - Separate: dev, staging, production- Environment-specific configs- Secrets management- Database migration automation |
| NFR-MAIN-003.3 | Rollback capability | - Keep last 5 deployments- One-click rollback- Database migration rollback scripts- Health check before traffic routing |

---

### 7.5 Usability

### NFR-USE-001: API Design

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-USE-001.1 | RESTful conventions | - Proper HTTP methods (GET, POST, PUT, DELETE)- Resource-based URLs- Proper status codes- Consistent naming (camelCase) |
| NFR-USE-001.2 | Response format | - Consistent JSON structure- Success: {success, message, data}- Error: {success, message, error}- Pagination: {data, meta} |
| NFR-USE-001.3 | API versioning | - URL versioning (/api/v1/)- Deprecation notices- 6-month deprecation period- Changelog maintained |

### NFR-USE-002: Documentation

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-USE-002.1 | API documentation | - OpenAPI 3.0 specification- Swagger UI available- Request/response examples- Authentication instructions |
| NFR-USE-002.2 | Developer documentation | - Setup instructions- Environment configuration- Database schema documentation- Troubleshooting guide |

---

### 7.6 Compliance

### NFR-COMP-001: Healthcare Compliance

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-COMP-001.1 | Data Security | - PHI encryption at rest and in transit- Access controls and audit logs- Business Associate Agreements (BAAs)- Regular compliance audits |
| NFR-COMP-001.2 | Data retention | - Medical records: 7 years- Payment records: indefinite- Prescription records: 7 years- Audit logs: 7 years |
| NFR-COMP-001.3 | Patient rights | - Data access (patient can download data)- Data deletion (right to be forgotten)- Data portability (export to JSON/PDF)- Privacy policy acceptance |

### NFR-COMP-002: Payment Compliance

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR-COMP-002.1 | PCI DSS compliance | - Never store card details- Stripe handles payment data- Tokenization for payment methods- Annual PCI audit |
| NFR-COMP-002.2 | Financial regulations | - Invoice generation- Tax calculations (if applicable)- Refund processing- Transaction records |

---

## 8. Technical Implementation Details

### 8.1 Technology Stack

### Backend Framework

```tsx
- Runtime: Node.js 20.x LTS
- Framework: Express.js (latest)
- Language: TypeScript 5.x
- Package Manager: pnpm
```

### Database & ORM

```tsx
- Database: PostgreSQL 16.x
- ORM: Prisma 7.x (multi-file schema)
- Schema Files:
  - base.prisma (User, AuthUser, AuthSession, etc.)
  - admin.prisma (Admin model)
  - doctor.prisma (Doctor model)
  - patient.prisma (Patient, PatientHealthData)
  - specialty.prisma (Specialty, DoctorSpecialty)
  - schedule.prisma (Schedule, DoctorSchedule)
  - appointment.prisma (Appointment model)
  - payment.prisma (Payment model)
  - prescription.prisma (Prescription model)
  - review.prisma (Review model)
  - medical-report.prisma (MedicalReport model)
```

### Caching & Session

```tsx
- Cache: Redis (latest)
- Session: Better Auth with Redis store
- Cache Strategy: Write-through, Cache-aside
```

### Authentication

```tsx
- Auth Library: Better Auth
- Strategy: Session-based + JWT
- Providers: Email/Password
- Features: Email verification, password reset
```

### Payment Processing

```tsx
- Payment Gateway: Stripe
- API Version: 2023-10-16+
- Features: Payment Intent, Webhooks, Refunds
```

### File Storage

```tsx
- Storage: AWS S3 (or compatible)
- Use Cases: Profile photos, medical reports, prescriptions
- Access: Signed URLs with expiry
```

### Email Service

```tsx
- Provider: Nodemailer with SMTP
- Templates: Handlebars/EJS
- Use Cases: Verification, notifications, prescriptions
```

### Logging

```tsx
- Logger: Winston
- Transports: Console, File, Cloud (optional)
- Levels: error, warn, info, debug
- Format: JSON structured logging
```

### Validation

```tsx
- Schema Validation: Zod
- Input Sanitization: express-validator
- File Validation: Custom middleware
```

---

### 8.2 Project Structure

```
Backend-My-PH-HealthCare/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── database.ts           # Prisma client
│   │   ├── redis.ts              # Redis client
│   │   ├── auth.ts               # Better Auth config
│   │   ├── stripe.ts             # Stripe config
│   │   └── logger.ts             # Winston config
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── admin/
│   │   ├── doctor/
│   │   ├── patient/
│   │   ├── specialty/
│   │   ├── schedule/
│   │   ├── appointment/
│   │   ├── payment/
│   │   ├── prescription/
│   │   └── review/
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── rbac.middleware.ts    # Role-based access
│   │   ├── error.middleware.ts   # Global error handler
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── rateLimit.middleware.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── pagination.ts
│   │   └── fileUpload.ts
│   ├── types/
│   │   ├── express.d.ts          # Express type extensions
│   │   └── index.ts
│   └── constants/
│       ├── roles.ts
│       ├── httpStatus.ts
│       └── index.ts
├── prisma/
│   ├── schema/                   # Multi-file schema
│   │   ├── base.prisma
│   │   ├── admin.prisma
│   │   ├── doctor.prisma
│   │   ├── patient.prisma
│   │   ├── specialty.prisma
│   │   ├── schedule.prisma
│   │   ├── appointment.prisma
│   │   ├── payment.prisma
│   │   ├── prescription.prisma
│   │   ├── review.prisma
│   │   └── medical-report.prisma
│   └── seed.ts                   # Database seeding
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                         # Documentation
├── uploads/                      # Temporary file uploads
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

---

### 8.3 Database Design Principles

### Implemented Patterns

1. **Soft Delete Pattern**
    - All models have `isDeleted` field
    - Never permanently delete data
    - Filter soft-deleted records in queries
    - Admin can restore deleted records
2. **Denormalization Strategy**
    - Store frequently accessed data (doctor fee, patient name)
    - Reduce joins for better performance
    - Update denormalized data on source update
    - Trade-off: Storage vs Performance
3. **Junction Tables**
    - DoctorSpecialty: Many-to-many (Doctor ↔︎ Specialty)
    - DoctorSchedule: Many-to-many (Doctor ↔︎ Schedule)
    - Composite keys for uniqueness
4. **Enum Usage**
    - UserRole, UserStatus, Gender, BloodGroup
    - AppointmentStatus, PaymentStatus
    - MaritalStatus, ReportType
    - Database-level constraints
5. **Timestamp Tracking**
    - createdAt, updatedAt (automatic)
    - Custom timestamps for specific events
    - Audit trail for compliance

---

### 8.4 API Response Standards

### Success Response Format

```tsx
{
  success: true,
  message: string,
  data: T | T[] | null,
  meta?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Error Response Format

```tsx
{
  success: false,
  message: string,
  error?: {
    code: string,
    details?: any
  },
  statusCode: number
}
```

### HTTP Status Codes Used

- 200: OK (Success)
- 201: Created (Resource created)
- 204: No Content (Delete success)
- 400: Bad Request (Validation error)
- 401: Unauthorized (Not authenticated)
- 403: Forbidden (Not authorized)
- 404: Not Found (Resource not found)
- 409: Conflict (Duplicate, constraint violation)
- 413: Payload Too Large (File too large)
- 422: Unprocessable Entity (Business logic error)
- 429: Too Many Requests (Rate limit exceeded)
- 500: Internal Server Error (Server error)
- 503: Service Unavailable (Maintenance, overload)

---