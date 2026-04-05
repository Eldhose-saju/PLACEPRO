# =============================================================================
# Job Routes — Job Postings
# =============================================================================
# GET  /api/jobs      — List all jobs with company name (JOIN query)
# POST /api/jobs      — Add a new job posting (admin only)
# PUT  /api/jobs/<id> — Update a job posting (admin only)
# DELETE /api/jobs/<id> — Delete a job posting (admin only)
# =============================================================================

from flask import Blueprint, request, jsonify
from db import get_connection
from auth import token_required, admin_required

job_bp = Blueprint('jobs', __name__)


@job_bp.route('/api/jobs', methods=['GET'])
@token_required
def get_all_jobs(current_user):
    """
    Fetch all jobs with their company names using an INNER JOIN.
    Demonstrates JOIN query — students can browse available positions.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # JOIN: Fetch jobs along with company name and location
        cursor.execute("""
            SELECT j.job_id, j.role, j.min_cgpa, j.salary, j.created_at,
                   c.company_id, c.name AS company_name, c.location AS company_location
            FROM jobs j
                INNER JOIN companies c ON j.company_id = c.company_id
            ORDER BY j.created_at DESC
        """)
        jobs = cursor.fetchall()

        # Convert Decimal and datetime objects
        for j in jobs:
            j['min_cgpa'] = float(j['min_cgpa'])
            j['salary'] = float(j['salary'])
            j['created_at'] = j['created_at'].isoformat() if j['created_at'] else None

        return jsonify(jobs), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@job_bp.route('/api/jobs', methods=['POST'])
@admin_required
def add_job(current_user):
    """
    Create a new job posting. Admin-only endpoint.
    Expects JSON: { company_id, role, min_cgpa, salary }
    """
    data = request.get_json()

    required = ['company_id', 'role']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """INSERT INTO jobs (company_id, role, min_cgpa, salary)
               VALUES (%s, %s, %s, %s)""",
            (data['company_id'], data['role'],
             data.get('min_cgpa', 0), data.get('salary', 0))
        )
        conn.commit()

        return jsonify({
            'message': 'Job posted successfully',
            'job_id': cursor.lastrowid
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@job_bp.route('/api/jobs/<int:job_id>', methods=['PUT'])
@admin_required
def update_job(current_user, job_id):
    """
    Update an existing job posting. Admin-only endpoint.
    """
    data = request.get_json()

    try:
        conn = get_connection()
        cursor = conn.cursor()

        updates = []
        values = []
        for field in ['company_id', 'role', 'min_cgpa', 'salary']:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            return jsonify({'error': 'No fields to update'}), 400

        values.append(job_id)
        query = f"UPDATE jobs SET {', '.join(updates)} WHERE job_id = %s"
        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Job not found'}), 404

        return jsonify({'message': 'Job updated successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@job_bp.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@admin_required
def delete_job(current_user, job_id):
    """
    Delete a job posting. Admin-only endpoint.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM jobs WHERE job_id = %s", (job_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Job not found'}), 404

        return jsonify({'message': 'Job deleted successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
