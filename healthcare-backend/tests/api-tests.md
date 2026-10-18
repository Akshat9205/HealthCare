# Healthcare Management API - Endpoint Testing Guide

Comprehensive reference and testing documentation for all 16 API endpoints across Authentication, Patients, Doctors, and Patient-Doctor Mappings.

---

## Base URL
```text
http://localhost:5001
```

---

## Complete Endpoint Summary (16 Endpoints)

| # | Domain | Method | Endpoint | Auth Required | Description |
|---|---|---|---|---|---|
| 1 | System | `GET` | `/api/health` | No | Health check for API & PostgreSQL |
| 2 | System | `GET` | `/` | No | API Welcome Route |
| 3 | Auth | `POST` | `/api/auth/register` | No | Register new user/doctor |
| 4 | Auth | `POST` | `/api/auth/login` | No | Login and obtain JWT token |
| 5 | Auth | `GET` | `/api/auth/me` | Yes (Bearer) | Get authenticated user profile |
| 6 | Patients | `POST` | `/api/patients` | Yes (Bearer) | Create new patient record |
| 7 | Patients | `GET` | `/api/patients` | Yes (Bearer) | List current user's patients |
| 8 | Patients | `GET` | `/api/patients/:id` | Yes (Bearer) | Get patient details (ownership enforced) |
| 9 | Patients | `PUT` | `/api/patients/:id` | Yes (Bearer) | Update patient (ownership enforced) |
| 10 | Patients | `DELETE` | `/api/patients/:id` | Yes (Bearer) | Delete patient (ownership enforced) |
| 11 | Doctors | `POST` | `/api/doctors` | Yes (Bearer) | Register new doctor in directory |
| 12 | Doctors | `GET` | `/api/doctors` | Yes (Bearer) | List all doctors (shared directory) |
| 13 | Doctors | `GET` | `/api/doctors/:id` | Yes (Bearer) | Get doctor details (shared directory) |
| 14 | Doctors | `PUT` | `/api/doctors/:id` | Yes (Bearer) | Update doctor (creator only) |
| 15 | Doctors | `DELETE` | `/api/doctors/:id` | Yes (Bearer) | Delete doctor (creator only) |
| 16 | Mappings | `POST` | `/api/mappings` | Yes (Bearer) | Assign doctor to patient |
| 17 | Mappings | `GET` | `/api/mappings` | Yes (Bearer) | List user's patient mappings |
| 18 | Mappings | `GET` | `/api/mappings/:patient_id` | Yes (Bearer) | List doctors assigned to patient |
| 19 | Mappings | `DELETE` | `/api/mappings/:id` | Yes (Bearer) | Remove patient-doctor assignment |

---

## 1. System Endpoints

### 1.1 `GET /api/health`
- **Auth:** None
- **Response 200 OK:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-10-18T17:14:45.364Z",
  "uptime": 17.72
}
```

---

## 2. Authentication Endpoints

### 2.1 `POST /api/auth/register`
- **Auth:** None
- **Request Body:**
```json
{
  "name": "Dr. Sarah Connor",
  "email": "sarah@hospital.com",
  "password": "Password123!"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Sarah Connor",
      "email": "sarah@hospital.com",
      "created_at": "2026-10-18T17:15:00.000Z"
    }
  }
}
```

### 2.2 `POST /api/auth/login`
- **Auth:** None
- **Request Body:**
```json
{
  "email": "sarah@hospital.com",
  "password": "Password123!"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Dr. Sarah Connor",
      "email": "sarah@hospital.com"
    }
  }
}
```

### 2.3 `GET /api/auth/me`
- **Auth:** Bearer Token
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Sarah Connor",
      "email": "sarah@hospital.com"
    }
  }
}
```

---

## 3. Patient Management Endpoints

### 3.1 `POST /api/patients`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "name": "James Wilson",
  "date_of_birth": "1988-06-15",
  "gender": "Male",
  "email": "james@example.com",
  "phone": "9876543210",
  "address": "42 Park Avenue, Delhi"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "patient": {
      "id": 1,
      "name": "James Wilson",
      "date_of_birth": "1988-06-15T00:00:00.000Z",
      "gender": "Male",
      "created_by": 1
    }
  }
}
```

### 3.2 `GET /api/patients`
- **Auth:** Bearer Token
- **Response 200 OK:**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "patients": [
      {
        "id": 1,
        "name": "James Wilson",
        "gender": "Male"
      }
    ]
  }
}
```

### 3.3 `GET /api/patients/:id`
- **Auth:** Bearer Token
- **Response 200 OK / 404 Not Found**

### 3.4 `PUT /api/patients/:id`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "phone": "9998887770",
  "address": "New Flat 102, Noida"
}
```
- **Response 200 OK**

### 3.5 `DELETE /api/patients/:id`
- **Auth:** Bearer Token
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

## 4. Doctor Management Endpoints

### 4.1 `POST /api/doctors`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "name": "Dr. Gregory House",
  "specialization": "Diagnostic Medicine",
  "email": "house@hospital.com",
  "phone": "9876543222",
  "qualification": "MD, Board Certified"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "doctor": {
      "id": 1,
      "name": "Dr. Gregory House",
      "specialization": "Diagnostic Medicine",
      "email": "house@hospital.com",
      "created_by": 1
    }
  }
}
```

### 4.2 `GET /api/doctors`
- **Auth:** Bearer Token (Shared directory accessible to all authenticated users)
- **Response 200 OK:**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "doctors": [
      {
        "id": 1,
        "name": "Dr. Gregory House",
        "specialization": "Diagnostic Medicine",
        "email": "house@hospital.com"
      }
    ]
  }
}
```

### 4.3 `GET /api/doctors/:id`
- **Auth:** Bearer Token
- **Response 200 OK / 404 Not Found**

### 4.4 `PUT /api/doctors/:id`
- **Auth:** Bearer Token (Only creator allowed; non-creators receive 403 Forbidden)
- **Request Body:**
```json
{
  "phone": "9876543333",
  "qualification": "MD, Head of Diagnostics"
}
```
- **Response 200 OK / 403 Forbidden**

### 4.5 `DELETE /api/doctors/:id`
- **Auth:** Bearer Token (Only creator allowed; non-creators receive 403 Forbidden)
- **Response 200 OK / 403 Forbidden:**
```json
{
  "success": true,
  "message": "Doctor deleted successfully"
}
```

---

## 5. Patient-Doctor Mapping Endpoints

### 5.1 `POST /api/mappings`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "patient_id": 1,
  "doctor_id": 1
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Doctor assigned to patient successfully",
  "data": {
    "mapping": {
      "id": 1,
      "patient_id": 1,
      "patient_name": "James Wilson",
      "doctor_id": 1,
      "doctor_name": "Dr. Gregory House",
      "doctor_specialization": "Diagnostic Medicine",
      "assigned_by": 1,
      "created_at": "2026-10-18T17:34:00.000Z"
    }
  }
}
```
- **Response 409 Conflict:** If doctor is already assigned to the patient.
- **Response 404 Not Found:** If patient or doctor does not exist, or patient is not owned by the user.

### 5.2 `GET /api/mappings`
- **Auth:** Bearer Token (Lists mappings for patients owned by authenticated user)
- **Response 200 OK:**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "mappings": [
      {
        "id": 1,
        "patient_id": 1,
        "patient_name": "James Wilson",
        "doctor_id": 1,
        "doctor_name": "Dr. Gregory House",
        "doctor_specialization": "Diagnostic Medicine",
        "assigned_by": 1,
        "created_at": "2026-10-18T17:34:00.000Z"
      }
    ]
  }
}
```

### 5.3 `GET /api/mappings/:patient_id`
- **Auth:** Bearer Token
- **Response 200 OK:**
```json
{
  "success": true,
  "patient": {
    "id": 1,
    "name": "James Wilson"
  },
  "count": 1,
  "data": {
    "doctors": [
      {
        "mapping_id": 1,
        "doctor_id": 1,
        "doctor_name": "Dr. Gregory House",
        "specialization": "Diagnostic Medicine",
        "email": "house@hospital.com",
        "phone": "9876543222",
        "qualification": "MD, Board Certified",
        "assigned_at": "2026-10-18T17:34:00.000Z"
      }
    ]
  }
}
```

### 5.4 `DELETE /api/mappings/:id`
- **Auth:** Bearer Token (Only patient owner can delete assignment)
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Patient-doctor assignment removed successfully"
}
```
