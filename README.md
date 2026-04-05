# College Placement Management System (PlaceMe)

A full-stack placement management system built with **Next.js** (frontend), **Flask** (backend), and **MySQL** (database).

## 🏗️ Project Structure

```
placement app/
├── backend/
│   ├── app.py              # Flask entry point
│   ├── config.py           # MySQL & JWT configuration
│   ├── db.py               # Database connection helper
│   ├── auth.py             # JWT auth decorators
│   ├── requirements.txt    # Python dependencies
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── student_routes.py
│   │   ├── company_routes.py
│   │   ├── job_routes.py
│   │   ├── application_routes.py
│   │   └── report_routes.py
│   └── sql/
│       ├── schema.sql      # DDL: tables, constraints, triggers, views
│       └── seed.sql        # DML: 50+ records per table
└── frontend/               # Next.js App Router with Tailwind CSS
    └── src/
        ├── app/            # Pages (login, register, dashboard, jobs, admin)
        ├── components/     # Navbar, StatsCard
        └── lib/            # API wrapper, AuthContext
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+
- **MySQL** 8.0+

### 1. Database Setup

```bash
# Log into MySQL and run the schema
mysql -u root -p < backend/sql/schema.sql

# Seed the database with sample data
mysql -u root -p < backend/sql/seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Update config.py with your MySQL password
# MYSQL_PASSWORD = 'your_password_here'

# Start Flask server (runs on port 5000)
python app.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server (runs on port 3000)
npm run dev
```

### 4. Open the App

Open **http://localhost:3000** in your browser.

**Demo Credentials:**
- Admin: `admin@placement.edu` / `password123`
- Student: `aarav.sharma@student.edu` / `password123`

## 📊 Database Concepts Demonstrated

| Concept | Where |
|---|---|
| **DDL** | `schema.sql` — CREATE TABLE, constraints |
| **DML** | `seed.sql` — INSERT statements |
| **JOINs** | `application_routes.py`, `job_routes.py` — INNER JOIN across 4 tables |
| **Aggregate Functions** | `report_routes.py` — COUNT, AVG, GROUP BY |
| **Views** | `placed_students_view` in `schema.sql` |
| **Triggers** | `trg_application_insert_log`, `trg_application_status_update_log` |
| **Constraints** | PK, FK, UNIQUE, CHECK, NOT NULL, ENUM |

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register student |
| POST | `/api/login` | Login (returns JWT) |
| GET | `/api/students` | List students (admin) |
| GET | `/api/profile` | Get student profile |
| GET/POST | `/api/companies` | List/add companies |
| GET/POST | `/api/jobs` | List/post jobs |
| POST | `/api/apply` | Apply to job |
| GET | `/api/applications` | List applications |
| PUT | `/api/applications/:id/status` | Update status (admin) |
| GET | `/api/reports/placements` | Placed students (VIEW) |
| GET | `/api/reports/statistics` | Aggregate stats |
