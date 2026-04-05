-- =============================================================================
-- College Placement Management System — Database Schema
-- =============================================================================
-- This file contains all DDL statements: CREATE DATABASE, CREATE TABLE,
-- CONSTRAINTS (PK, FK, UNIQUE, NOT NULL, CHECK, ENUM), VIEWS, and TRIGGERS.
-- =============================================================================

-- ─────────────────────────────────────────────
-- 1. DATABASE CREATION
-- ─────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

-- ─────────────────────────────────────────────
-- 2. DROP EXISTING OBJECTS (for clean re-runs)
-- ─────────────────────────────────────────────
DROP VIEW   IF EXISTS placed_students_view;
DROP VIEW   IF EXISTS company_stats_view;
DROP VIEW   IF EXISTS student_placement_summary;
DROP TABLE  IF EXISTS application_log;
DROP TABLE  IF EXISTS applications;
DROP TABLE  IF EXISTS jobs;
DROP TABLE  IF EXISTS companies;
DROP TABLE  IF EXISTS students;
DROP TABLE  IF EXISTS users;

-- =============================================================================
-- 3. TABLE DEFINITIONS (DDL) WITH CONSTRAINTS
-- =============================================================================

-- ─────────────────────────────────────────────
-- 3a. USERS table — Authentication
-- Constraints: PK, UNIQUE email, NOT NULL, ENUM role
-- ─────────────────────────────────────────────
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3b. STUDENTS table — Student profiles
-- Constraints: PK, FK→users, UNIQUE email & phone,
--              CHECK cgpa between 0 and 10, NOT NULL
-- ─────────────────────────────────────────────
CREATE TABLE students (
    student_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    cgpa        DECIMAL(3,1) NOT NULL,
    skills      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key linking to users table
    CONSTRAINT fk_student_user   FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,

    -- Check constraint: CGPA must be > 0 and <= 10
    CONSTRAINT chk_student_cgpa  CHECK (cgpa > 0 AND cgpa <= 10)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3c. COMPANIES table — Company directory
-- Constraints: PK, NOT NULL name
-- ─────────────────────────────────────────────
CREATE TABLE companies (
    company_id  INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    location    VARCHAR(150),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3d. JOBS table — Job postings
-- Constraints: PK, FK→companies, NOT NULL role,
--              CHECK min_cgpa >= 0, CHECK salary >= 0
-- ─────────────────────────────────────────────
CREATE TABLE jobs (
    job_id      INT AUTO_INCREMENT PRIMARY KEY,
    company_id  INT NOT NULL,
    role        VARCHAR(100) NOT NULL,
    min_cgpa    DECIMAL(3,1) DEFAULT 0.0,
    salary      DECIMAL(12,2) DEFAULT 0.00,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key: every job belongs to a company
    CONSTRAINT fk_job_company  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,

    -- Check constraints
    CONSTRAINT chk_job_cgpa    CHECK (min_cgpa >= 0 AND min_cgpa <= 10),
    CONSTRAINT chk_job_salary  CHECK (salary >= 0)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3e. APPLICATIONS table — Student applications
-- Constraints: PK, FK→students, FK→jobs,
--              ENUM status, UNIQUE (student_id, job_id)
-- ─────────────────────────────────────────────
CREATE TABLE applications (
    application_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    job_id          INT NOT NULL,
    status          ENUM('applied', 'shortlisted', 'selected', 'rejected') NOT NULL DEFAULT 'applied',
    applied_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys: referential integrity
    CONSTRAINT fk_app_student  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job      FOREIGN KEY (job_id)     REFERENCES jobs(job_id)         ON DELETE CASCADE,

    -- Unique constraint: a student can apply to a job only once
    CONSTRAINT uq_student_job  UNIQUE (student_id, job_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- 3f. APPLICATION_LOG table — Audit log (populated by trigger)
-- ─────────────────────────────────────────────
CREATE TABLE application_log (
    log_id          INT AUTO_INCREMENT PRIMARY KEY,
    application_id  INT,
    student_id      INT,
    job_id          INT,
    action          VARCHAR(50) NOT NULL,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20),
    logged_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =============================================================================
-- 4. VIEWS
-- =============================================================================

-- ─────────────────────────────────────────────
-- VIEW: placed_students_view
-- Shows students who have been SELECTED for a job.
-- Uses INNER JOIN across students, applications, jobs, companies.
-- ─────────────────────────────────────────────
CREATE VIEW placed_students_view AS
SELECT
    s.student_id,
    s.name        AS student_name,
    s.email       AS student_email,
    c.name        AS company_name,
    c.location    AS company_location,
    j.role        AS job_role,
    j.salary      AS salary,
    a.applied_at
FROM applications a
    INNER JOIN students  s ON a.student_id = s.student_id
    INNER JOIN jobs      j ON a.job_id     = j.job_id
    INNER JOIN companies c ON j.company_id = c.company_id
WHERE a.status = 'selected';


-- ─────────────────────────────────────────────
-- VIEW: company_stats_view
-- Aggregate statistics per company using LEFT JOIN, COUNT, AVG, MIN, MAX.
-- Demonstrates: LEFT JOIN, GROUP BY, multiple aggregate functions.
-- ─────────────────────────────────────────────
CREATE VIEW company_stats_view AS
SELECT
    c.company_id,
    c.name        AS company_name,
    c.location,
    COUNT(DISTINCT j.job_id)                                              AS total_jobs,
    COUNT(a.application_id)                                               AS total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN a.student_id END) AS students_hired,
    ROUND(COALESCE(AVG(j.salary), 0), 2)                                  AS avg_salary_offered,
    COALESCE(MAX(j.salary), 0)                                            AS max_salary,
    COALESCE(MIN(j.salary), 0)                                            AS min_salary
FROM companies c
    LEFT JOIN jobs         j ON c.company_id = j.company_id
    LEFT JOIN applications a ON j.job_id     = a.job_id
GROUP BY c.company_id, c.name, c.location;


-- ─────────────────────────────────────────────
-- VIEW: student_placement_summary
-- Per-student application overview using LEFT JOIN and conditional aggregates.
-- Demonstrates: LEFT JOIN, SUM(CASE WHEN), MAX with condition.
-- ─────────────────────────────────────────────
CREATE VIEW student_placement_summary AS
SELECT
    s.student_id,
    s.name       AS student_name,
    s.email      AS student_email,
    s.cgpa,
    COUNT(a.application_id)                                     AS total_applications,
    SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END)     AS selections,
    SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END)     AS rejections,
    MAX(CASE WHEN a.status = 'selected' THEN j.salary END)      AS highest_offer
FROM students s
    LEFT JOIN applications a ON s.student_id = a.student_id
    LEFT JOIN jobs         j ON a.job_id     = j.job_id
GROUP BY s.student_id, s.name, s.email, s.cgpa;


-- =============================================================================
-- 5. TRIGGERS
-- =============================================================================

-- ─────────────────────────────────────────────
-- TRIGGER 1: trg_application_insert_log
-- Fires AFTER INSERT on applications.
-- Logs every new application into the application_log table.
-- ─────────────────────────────────────────────
DELIMITER //
CREATE TRIGGER trg_application_insert_log
AFTER INSERT ON applications
FOR EACH ROW
BEGIN
    INSERT INTO application_log (application_id, student_id, job_id, action, new_status)
    VALUES (NEW.application_id, NEW.student_id, NEW.job_id, 'INSERT', NEW.status);
END //
DELIMITER ;

-- ─────────────────────────────────────────────
-- TRIGGER 2: trg_application_status_update_log
-- Fires AFTER UPDATE on applications.
-- Logs every status change into the application_log table.
-- ─────────────────────────────────────────────
DELIMITER //
CREATE TRIGGER trg_application_status_update_log
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO application_log (application_id, student_id, job_id, action, old_status, new_status)
        VALUES (NEW.application_id, NEW.student_id, NEW.job_id, 'STATUS_UPDATE', OLD.status, NEW.status);
    END IF;
END //
DELIMITER ;


-- ─────────────────────────────────────────────
-- TRIGGER 3: trg_prevent_rejected_to_selected
-- Fires BEFORE UPDATE on applications.
-- Prevents changing a rejected application directly to selected.
-- Demonstrates: BEFORE trigger with SIGNAL (business rule enforcement).
-- ─────────────────────────────────────────────
DELIMITER //
CREATE TRIGGER trg_prevent_rejected_to_selected
BEFORE UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status = 'rejected' AND NEW.status = 'selected' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot select a previously rejected application';
    END IF;
END //
DELIMITER ;


-- =============================================================================
-- 6. EXAMPLE QUERIES (for reference — do not execute automatically)
-- =============================================================================

-- ─── JOIN: Fetch all applications with student, job, and company details ───
-- SELECT a.application_id, s.name AS student, j.role AS job_role,
--        c.name AS company, j.salary, a.status
-- FROM applications a
--     INNER JOIN students  s ON a.student_id = s.student_id
--     INNER JOIN jobs      j ON a.job_id     = j.job_id
--     INNER JOIN companies c ON j.company_id = c.company_id;

-- ─── AGGREGATE: Count of placed students ───
-- SELECT COUNT(DISTINCT student_id) AS placed_count
-- FROM applications WHERE status = 'selected';

-- ─── AGGREGATE: Average salary offered to placed students ───
-- SELECT AVG(j.salary) AS avg_salary
-- FROM applications a
--     INNER JOIN jobs j ON a.job_id = j.job_id
-- WHERE a.status = 'selected';

-- ─── AGGREGATE: Total applications per company ───
-- SELECT c.name AS company, COUNT(a.application_id) AS total_applications
-- FROM applications a
--     INNER JOIN jobs      j ON a.job_id     = j.job_id
--     INNER JOIN companies c ON j.company_id = c.company_id
-- GROUP BY c.company_id, c.name
-- ORDER BY total_applications DESC;

-- ─── VIEW query ───
-- SELECT * FROM placed_students_view;
