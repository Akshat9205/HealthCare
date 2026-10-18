-- =============================================================================
-- Healthcare Management System Database Schema
-- Database: healthcare_db
-- =============================================================================

-- Setup Instructions:
-- -------------------
-- 1. Using psql (Command Line):
--    psql -U postgres -c "CREATE DATABASE healthcare_db;"
--    psql -U postgres -d healthcare_db -f sql/schema.sql
--
-- 2. Using pgAdmin 4:
--    - Connect to your PostgreSQL server.
--    - Right-click 'Databases' -> Create -> Database... -> Name it 'healthcare_db' -> Save.
--    - Right-click 'healthcare_db' -> Select 'Query Tool'.
--    - Open or paste the contents of this schema.sql file.
--    - Click the 'Execute/Refresh' (Play icon) or press F5.
-- =============================================================================

-- 1. Users Table
-- Stores healthcare providers / system users who manage patient records.
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Case-insensitive index on user email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- 2. Patients Table
-- Stores patient demographics and records. Enforces multi-tenant ownership via created_by.
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes on patients for ownership isolation and performant queries
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_dob ON patients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

-- 3. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for patients table
DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
