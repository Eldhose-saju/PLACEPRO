# =============================================================================
# Application Routes — Student Job Applications
# =============================================================================
# POST /api/apply                       — Student applies to a job
# GET  /api/applications                — List applications (filtered by role)
# PUT  /api/applications/<id>/status    — Admin updates application status
# =============================================================================

from flask import Blueprint, request, jsonify
from db import get_connection
from auth import token_required, admin_required

application_bp = Blueprint('applications', __name__)


@application_bp.route('/api/apply', methods=['POST'])
@token_required
def apply_to_job(current_user):
    """
    Student applies to a job posting.
    Expects JSON: { job_id }
    Checks:
      1. User must be a student
      2. Student's CGPA must meet the job's min_cgpa (eligibility check)
      3. Student must not have already applied to this job (UNIQUE constraint)
    Triggers: trg_application_insert_log fires automatically on INSERT.
    """
    if current_user.get('role') != 'student':
        return jsonify({'error': 'Only students can apply to jobs'}), 403

    data = request.get_json()
    job_id = data.get('job_id')

    if not job_id:
        return jsonify({'error': 'job_id is required'}), 400

    student_id = current_user.get('student_id')
    if not student_id:
        return jsonify({'error': 'Student profile not found'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch student CGPA
        cursor.execute("SELECT cgpa FROM students WHERE student_id = %s", (student_id,))
        student = cursor.fetchone()
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        # Fetch job's minimum CGPA requirement
        cursor.execute("SELECT min_cgpa, role FROM jobs WHERE job_id = %s", (job_id,))
        job = cursor.fetchone()
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        # Eligibility check: CGPA >= min_cgpa
        if float(student['cgpa']) < float(job['min_cgpa']):
            return jsonify({
                'error': f"Your CGPA ({student['cgpa']}) does not meet the minimum requirement ({job['min_cgpa']})"
            }), 400

        # Check for duplicate application (also enforced by UNIQUE constraint)
        cursor.execute(
            "SELECT application_id FROM applications WHERE student_id = %s AND job_id = %s",
            (student_id, job_id)
        )
        if cursor.fetchone():
            return jsonify({'error': 'You have already applied to this job'}), 409

        # Insert application — trigger fires automatically
        cursor.execute(
            "INSERT INTO applications (student_id, job_id, status) VALUES (%s, %s, 'applied')",
            (student_id, job_id)
        )
        conn.commit()

        return jsonify({
            'message': f"Successfully applied to {job['role']}",
            'application_id': cursor.lastrowid
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@application_bp.route('/api/applications', methods=['GET'])
@token_required
def get_applications(current_user):
    """
    Fetch applications.
    - Students: see only their own applications
    - Admins: see all applications
    Uses JOIN across applications, students, jobs, and companies tables.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Base JOIN query: applications + students + jobs + companies
        base_query = """
            SELECT a.application_id, a.status, a.applied_at,
                   s.student_id, s.name AS student_name, s.email AS student_email, s.cgpa,
                   j.job_id, j.role AS job_role, j.salary,
                   c.company_id, c.name AS company_name, c.location AS company_location
            FROM applications a
                INNER JOIN students  s ON a.student_id = s.student_id
                INNER JOIN jobs      j ON a.job_id     = j.job_id
                INNER JOIN companies c ON j.company_id = c.company_id
        """

        if current_user['role'] == 'student':
            # Students see only their own applications
            query = base_query + " WHERE a.student_id = %s ORDER BY a.applied_at DESC"
            cursor.execute(query, (current_user['student_id'],))
        else:
            # Admins see all applications
            query = base_query + " ORDER BY a.applied_at DESC"
            cursor.execute(query)

        applications = cursor.fetchall()

        # Convert types for JSON serialization
        for a in applications:
            a['cgpa'] = float(a['cgpa']) if a.get('cgpa') else None
            a['salary'] = float(a['salary']) if a.get('salary') else None
            a['applied_at'] = a['applied_at'].isoformat() if a.get('applied_at') else None

        return jsonify(applications), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@application_bp.route('/api/applications/<int:application_id>/status', methods=['PUT'])
@admin_required
def update_application_status(current_user, application_id):
    """
    Admin updates an application's status.
    Expects JSON: { status }  (one of: applied, shortlisted, selected, rejected)
    Trigger: trg_application_status_update_log fires on UPDATE.
    """
    data = request.get_json()
    new_status = data.get('status')

    valid_statuses = ['applied', 'shortlisted', 'selected', 'rejected']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE applications SET status = %s WHERE application_id = %s",
            (new_status, application_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Application not found'}), 404

        return jsonify({'message': f'Application status updated to {new_status}'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
