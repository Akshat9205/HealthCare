# Healthcare Management System - Backend API

Production-ready Node.js and Express backend for a Healthcare Management System. Built using PostgreSQL (`pg` connection pool with no ORM), ES modules, JWT authentication with Bearer token enforcement, bcryptjs password hashing, express-validator input sanitization, multi-tenant patient record ownership, shared doctor directory, and patient-doctor mappings.

---

## Architecture & Tech Stack

- **Runtime & Framework:** Node.js (v18+) with Express.js (ES modules: `"type": "module"`)
- **Database:** PostgreSQL accessed via `pg` (Node-Postgres) connection pool using parameterized SQL queries. **No ORM or Prisma**.
- **Authentication & Security:**
  - `jsonwebtoken`: Stateless authentication with signed JWT tokens
  - `bcryptjs`: Salted password hashing (10 salt rounds)
  - `helmet`: Hardened HTTP response security headers
  - `cors`: Configurable Cross-Origin Resource Sharing policy
  - Express payload parsing with strict 10 KB size limits
- **Validation:** `express-validator` middleware
- **Automated Testing:** `vitest` and `supertest` for fast unit and integration testing

---

## Project Structure

```text
healthcare-backend/
├── src/
│   ├── config/
│   │   ├── db.js             # PostgreSQL connection pool & helpers
│   │   └── env.js            # Environment validation
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login & profile
│   │   ├── patient.controller.js  # Patient CRUD with ownership enforcement
│   │   ├── doctor.controller.js   # Doctor CRUD & modification permissions
│   │   └── mapping.controller.js  # Patient-doctor mapping handlers
│   ├── routes/
│   │   ├── auth.routes.js         # Authentication routes
│   │   ├── patient.routes.js      # Patient routes
│   │   ├── doctor.routes.js       # Doctor routes
│   │   └── mapping.routes.js      # Patient-doctor mapping routes
│   ├── middleware/
│   │   ├── authenticate.js   # JWT verification middleware
│   │   ├── validate.js       # express-validator result handler
│   │   ├── notFound.js       # 404 handler
│   │   └── errorHandler.js   # Centralized error handler
│   ├── validators/
│   │   ├── auth.validator.js      # Validation for register/login
│   │   ├── patient.validator.js   # Validation for patient records
│   │   ├── doctor.validator.js    # Validation for doctor records
│   │   └── mapping.validator.js   # Validation for mapping records
│   ├── utils/
│   │   └── asyncHandler.js   # Async error wrapper
│   ├── app.js                # Express application configuration
│   └── server.js             # Server entry point
├── sql/
│   └── schema.sql            # PostgreSQL schema for users, patients, doctors, mappings
├── tests/
│   ├── auth.test.js          # Authentication test suite
│   ├── patient.test.js       # Patient CRUD test suite
│   ├── doctor.test.js        # Doctor CRUD test suite
│   ├── mapping.test.js       # Mapping test suite
│   └── api-tests.md          # Comprehensive endpoint documentation
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
├── package.json              # Dependencies and scripts
└── README.md                 # Complete documentation
```

---

## PostgreSQL Database Setup on Windows

### 1. Database Creation
In Windows PowerShell:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE healthcare_db;"
```

### 2. Apply Schema
```powershell
cd c:\Users\LENOVO\Desktop\Healthcare\healthcare-backend
$env:PGPASSWORD='1234'; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d healthcare_db -f sql/schema.sql
```

The schema creates:
- `users` table
- `patients` table (with `created_by` foreign key referencing `users`)
- `doctors` table (with `created_by` foreign key referencing `users`)
- `patient_doctor_mappings` table (with unique constraint on `patient_id` and `doctor_id`)
- Performance indexes and automatic `updated_at` triggers

---

## Environment Configuration

Create a `.env` file in `healthcare-backend/` based on `.env.example`:

```ini
NODE_ENV=development
PORT=5001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=postgres
DB_PASSWORD=1234
DB_SSL=false

JWT_SECRET=supersecretjwtkey_1234567890
JWT_EXPIRES_IN=24h

CORS_ORIGIN=*
```

---

## Running the Application

### 1. Install Dependencies
```powershell
cd c:\Users\LENOVO\Desktop\Healthcare\healthcare-backend
npm install
```

### 2. Development Mode (Auto-reload)
```powershell
npm run dev
```

### 3. Production Mode
```powershell
npm start
```

### 4. Run Automated Tests
```powershell
npm test
```

---

## API Summary (All 16 Endpoints)

Base URL: `http://localhost:5001`

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get profile (Auth: Bearer)

### Patients
- `POST /api/patients` - Create patient (Auth: Bearer, `created_by` from token)
- `GET /api/patients` - List current user's patients (Auth: Bearer)
- `GET /api/patients/:id` - Get patient details (Auth: Bearer, owner only)
- `PUT /api/patients/:id` - Update patient (Auth: Bearer, owner only)
- `DELETE /api/patients/:id` - Delete patient (Auth: Bearer, owner only)

### Doctors
- `POST /api/doctors` - Create doctor (Auth: Bearer)
- `GET /api/doctors` - List all doctors (Auth: Bearer, shared directory)
- `GET /api/doctors/:id` - Get doctor details (Auth: Bearer, shared directory)
- `PUT /api/doctors/:id` - Update doctor (Auth: Bearer, creator only)
- `DELETE /api/doctors/:id` - Delete doctor (Auth: Bearer, creator only)

### Patient-Doctor Mappings
- `POST /api/mappings` - Assign doctor to patient (Auth: Bearer, patient owner only)
- `GET /api/mappings` - List user's patient mappings (Auth: Bearer)
- `GET /api/mappings/:patient_id` - List doctors for a patient (Auth: Bearer, patient owner only)
- `DELETE /api/mappings/:id` - Remove assignment (Auth: Bearer, patient owner only)

Detailed request/response payloads can be found in `tests/api-tests.md`.

---

## Security & Permission Model

1. **Patient Ownership:**
   - Every patient query explicitly binds `WHERE created_by = req.user.id`.
   - Another user accessing, updating, or deleting a patient receives `404 Not Found`.

2. **Shared Doctor Directory:**
   - Any authenticated user can view the doctor directory (`GET /api/doctors` and `GET /api/doctors/:id`).
   - Only the doctor creator can update (`PUT`) or delete (`DELETE`) a doctor. Unauthorized attempts receive `403 Forbidden`.

3. **Mapping Isolation:**
   - A user can only assign doctors to patients they created.
   - A user can only view or delete mappings for their own patients.
   - Duplicate assignments are prevented by both database unique constraint and controller validation.

---

## Connecting a Future React Frontend

When connecting a React frontend (e.g. Vite or Create React App):

1. **CORS:** The backend is configured to accept requests from any origin or specified URLs via `CORS_ORIGIN` in `.env`.
2. **Axios / Fetch Setup:**
   ```javascript
   import axios from 'axios';

   const api = axios.create({
     baseURL: 'http://localhost:5001/api',
   });

   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export default api;
   ```
3. **Login Flow:** On login, store `data.token` in `localStorage` or `sessionStorage`, and attach it to subsequent requests.
