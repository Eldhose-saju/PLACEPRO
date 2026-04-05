# =============================================================================
# Report Routes — Aggregate Queries & Views
# =============================================================================
# GET /api/reports/placements  — Placed students (from VIEW)
# GET /api/reports/statistics  — Aggregate statistics (COUNT, AVG, GROUP BY)
# =============================================================================

from flask import Blueprint, jsonify
from db import get_connection
from auth import token_required, admin_required

report_bp = Blueprint('reports', __name__)


@report_bp.route('/api/reports/placements', methods=['GET'])
@token_required
def get_placements(current_user):
    """
    Fetch all placed students using the placed_students_view.
    This demonstrates the use of database VIEWS.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Query the VIEW directly
        cursor.execute("SELECT * FROM placed_students_view ORDER BY salary DESC")
        placements = cursor.fetchall()

        for p in placements:
            p['salary'] = float(p['salary']) if p.get('salary') else None
            p['applied_at'] = p['applied_at'].isoformat() if p.get('applied_at') else None

        return jsonify(placements), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@report_bp.route('/api/reports/statistics', methods=['GET'])
@token_required
def get_statistics(current_user):
    """
    Compute aggregate statistics using COUNT, AVG, and GROUP BY.
    Returns:
      - total_students: COUNT of all students
      - total_companies: COUNT of all companies
      - total_jobs: COUNT of all jobs
      - total_applications: COUNT of all applications
      - placed_students: COUNT(DISTINCT student_id) WHERE status = 'selected'
      - avg_salary: AVG salary of placed students
      - applications_per_company: GROUP BY company with COUNT
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        stats = {}

        # Total students (COUNT)
        cursor.execute("SELECT COUNT(*) AS count FROM students")
        stats['total_students'] = cursor.fetchone()['count']

        # Total companies (COUNT)
        cursor.execute("SELECT COUNT(*) AS count FROM companies")
        stats['total_companies'] = cursor.fetchone()['count']

        # Total jobs (COUNT)
        cursor.execute("SELECT COUNT(*) AS count FROM jobs")
        stats['total_jobs'] = cursor.fetchone()['count']

        # Total applications (COUNT)
        cursor.execute("SELECT COUNT(*) AS count FROM applications")
        stats['total_applications'] = cursor.fetchone()['count']

        # Count of placed students (AGGREGATE: COUNT DISTINCT)
        cursor.execute("""
            SELECT COUNT(DISTINCT student_id) AS count
            FROM applications
            WHERE status = 'selected'
        """)
        stats['placed_students'] = cursor.fetchone()['count']

        # Average salary offered to placed students (AGGREGATE: AVG + JOIN)
        cursor.execute("""
            SELECT ROUND(AVG(j.salary), 2) AS avg_salary
            FROM applications a
                INNER JOIN jobs j ON a.job_id = j.job_id
            WHERE a.status = 'selected'
        """)
        result = cursor.fetchone()
        stats['avg_salary'] = float(result['avg_salary']) if result['avg_salary'] else 0

        # Applications per company (AGGREGATE: GROUP BY + COUNT + JOIN)
        cursor.execute("""
            SELECT c.name AS company_name, COUNT(a.application_id) AS total_applications
            FROM applications a
                INNER JOIN jobs      j ON a.job_id     = j.job_id
                INNER JOIN companies c ON j.company_id = c.company_id
            GROUP BY c.company_id, c.name
            ORDER BY total_applications DESC
        """)
        stats['applications_per_company'] = cursor.fetchall()

        # Status distribution (AGGREGATE: GROUP BY + COUNT)
        cursor.execute("""
            SELECT status, COUNT(*) AS count
            FROM applications
            GROUP BY status
            ORDER BY count DESC
        """)
        stats['status_distribution'] = cursor.fetchall()

        # Highest salary offered to a placed student (AGGREGATE: MAX + JOIN)
        cursor.execute("""
            SELECT MAX(j.salary) AS max_salary
            FROM applications a
                INNER JOIN jobs j ON a.job_id = j.job_id
            WHERE a.status = 'selected'
        """)
        result = cursor.fetchone()
        stats['max_salary'] = float(result['max_salary']) if result['max_salary'] else 0

        # Lowest salary offered to a placed student (AGGREGATE: MIN + JOIN)
        cursor.execute("""
            SELECT MIN(j.salary) AS min_salary
            FROM applications a
                INNER JOIN jobs j ON a.job_id = j.job_id
            WHERE a.status = 'selected'
        """)
        result = cursor.fetchone()
        stats['min_salary'] = float(result['min_salary']) if result['min_salary'] else 0

        # Company statistics from VIEW (LEFT JOIN demonstration)
        cursor.execute("""
            SELECT company_name, location, total_jobs, total_applications,
                   students_hired, avg_salary_offered, max_salary, min_salary
            FROM company_stats_view
            ORDER BY total_applications DESC
        """)
        company_stats = cursor.fetchall()
        for cs in company_stats:
            cs['avg_salary_offered'] = float(cs['avg_salary_offered']) if cs['avg_salary_offered'] else 0
            cs['max_salary'] = float(cs['max_salary']) if cs['max_salary'] else 0
            cs['min_salary'] = float(cs['min_salary']) if cs['min_salary'] else 0
        stats['company_stats'] = company_stats

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@report_bp.route('/api/reports/audit-log', methods=['GET'])
@admin_required
def get_audit_log(current_user):
    """
    Fetch the application audit log (populated by database triggers).
    Uses LEFT JOIN to include student, job, and company names.
    Demonstrates: trigger output visibility, LEFT JOIN across 4 tables.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT l.log_id, l.application_id, l.action, l.old_status, l.new_status, l.logged_at,
                   s.name        AS student_name,
                   j.role        AS job_role,
                   c.name        AS company_name
            FROM application_log l
                LEFT JOIN students  s ON l.student_id = s.student_id
                LEFT JOIN jobs      j ON l.job_id     = j.job_id
                LEFT JOIN companies c ON j.company_id = c.company_id
            ORDER BY l.logged_at DESC
            LIMIT 100
        """)
        logs = cursor.fetchall()

        for log in logs:
            log['logged_at'] = log['logged_at'].isoformat() if log.get('logged_at') else None

        return jsonify(logs), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
