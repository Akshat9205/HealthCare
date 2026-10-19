# 🏥 HealthCare Frontend — Patient & Doctor Management Dashboard

A modern, responsive healthcare SaaS web application built with React, Vite, and Tailwind CSS. It connects to the Node.js + Express + PostgreSQL backend to provide complete management of patients, doctors, and patient-doctor assignments.

---

## 🛠️ Tech Stack

- **React 18** + **Vite** — Fast, modern frontend tooling and development server
- **Tailwind CSS** — Utility-first styling with custom medical blue and teal palette
- **React Router DOM v6** — Client-side SPA routing with protected route guards
- **Axios** — HTTP client with Bearer token authentication and global interceptors
- **Framer Motion** — Smooth page transitions, modals, and interactive UI micro-animations
- **Lucide React** — Clean medical and administrative icons
- **React Hot Toast** — Toast notifications for immediate user feedback
- **Recharts** — Patient gender distribution and doctor specialty analytics

---

## 📁 Project Structure

```text
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          # Central Axios instance with JWT interceptors
│   │   ├── authApi.js        # Register, login, me, and health API calls
│   │   ├── patientApi.js     # Patient CRUD operations
│   │   ├── doctorApi.js      # Doctor directory CRUD operations
│   │   └── mappingApi.js     # Patient-doctor assignment operations
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx   # Desktop sidebar & mobile drawer
│   │   │   ├── Header.jsx    # Top bar with live backend health indicator
│   │   │   └── DashboardLayout.jsx
│   │   └── ui/
│   │       ├── Modal.jsx     # Accessible dialog with ESC & backdrop handlers
│   │       ├── ConfirmDialog.jsx
│   │       ├── Skeleton.jsx  # Card & table loading placeholders
│   │       ├── EmptyState.jsx# Informative state with action triggers
│   │       └── StatCard.jsx  # Animated KPI metric card
│   ├── context/
│   │   └── AuthContext.jsx   # Global session state & token management
│   ├── pages/
│   │   ├── Login.jsx         # Sign in screen with password toggle
│   │   ├── Register.jsx      # Account registration with validation
│   │   ├── Dashboard.jsx     # Overview with KPIs, charts & recent records
│   │   ├── Patients.jsx      # Patient table, filters, search & CRUD modals
│   │   ├── Doctors.jsx       # Doctor directory, search, specialty filters
│   │   ├── Assignments.jsx   # Map doctors to patients with dialogs
│   │   ├── Profile.jsx       # Authenticated practitioner profile
│   │   └── NotFound.jsx      # 404 error fallback screen
│   ├── routes/
│   │   └── ProtectedRoute.jsx# Auth guard redirecting to /login
│   ├── App.jsx               # Application routes & toast container
│   ├── main.jsx              # React DOM mounting & context providers
│   └── index.css             # Tailwind directives & custom scrollbars
├── .env                      # Live environment configuration
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `frontend/` directory (or use the preconfigured one):

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

> **Note:** The backend runs on port `5001` (`http://localhost:5001/api`).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000`

### 3. Production Build
```bash
npm run build
```
Creates an optimized production bundle inside the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🔐 Authentication & Workflow

1. **Sign Up / Log In**: Register a practitioner account on `/register` or sign in on `/login`.
2. **Dashboard**: View summary statistics, demographics charts, and recent activity.
3. **Patients**: Add patient records (name, DOB, gender, email, phone, address), search, filter, edit, and delete.
4. **Doctors**: Maintain the shared doctor directory. View doctor qualifications and specialties. Edit/delete options are enabled for records created by your account.
5. **Assignments**: Assign any registered doctor to any of your patients. Filter by patient and remove assignments when treatment completes.
