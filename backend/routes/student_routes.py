# =============================================================================
# Student Routes — CRUD Operations
# =============================================================================
# GET    /api/students      — List all students (admin)
# GET    /api/students/<id> — Get student by ID
# PUT    /api/students/<id> — Update student profile
# DELETE /api/students/<id> — Delete student (admin)
# GET    /api/profile       — Get current student's profile
# =============================================================================

from flask import Blueprint, request, jsonify
from db import get_connection
from auth import token_required, admin_required

student_bp = Blueprint('students', __name__)


@student_bp.route('/api/students', methods=['GET'])
@admin_required
def get_all_students(current_user):
    """
    Fetch all students. Admin-only endpoint.
    Uses SELECT query on students table.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT s.student_id, s.name, s.email, s.phone, s.cgpa, s.skills, s.created_at
            FROM students s
            ORDER BY s.student_id ASC
        """)
        students = cursor.fetchall()

        # Convert Decimal and datetime objects to JSON-serializable formats
        for s in students:
            s['cgpa'] = float(s['cgpa'])
            s['created_at'] = s['created_at'].isoformat() if s['created_at'] else None

        return jsonify(students), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@student_bp.route('/api/students/<int:student_id>', methods=['GET'])
@token_required
def get_student(current_user, student_id):
    """
    Fetch a single student by their student_id.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT student_id, name, email, phone, cgpa, skills, created_at FROM students WHERE student_id = %s",
            (student_id,)
        )
        student = cursor.fetchone()

        if not student:
            return jsonify({'error': 'Student not found'}), 404

        student['cgpa'] = float(student['cgpa'])
        student['created_at'] = student['created_at'].isoformat() if student['created_at'] else None

        return jsonify(student), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@student_bp.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """
    Fetch the current logged-in student's profile.
    Uses the student_id from the JWT payload.
    """
    if current_user.get('role') != 'student':
        return jsonify({'error': 'Only students have profiles'}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT student_id, name, email, phone, cgpa, skills, created_at FROM students WHERE student_id = %s",
            (current_user['student_id'],)
        )
        student = cursor.fetchone()

        if not student:
            return jsonify({'error': 'Profile not found'}), 404

        student['cgpa'] = float(student['cgpa'])
        student['created_at'] = student['created_at'].isoformat() if student['created_at'] else None

        return jsonify(student), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@student_bp.route('/api/students/<int:student_id>', methods=['PUT'])
@token_required
def update_student(current_user, student_id):
    """
    Update a student's profile information.
    Students can only update their own profile; admins can update any.
    """
    # Authorization: students can only edit their own profile
    if current_user['role'] == 'student' and current_user.get('student_id') != student_id:
        return jsonify({'error': 'You can only update your own profile'}), 403

    data = request.get_json()

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Build UPDATE query dynamically based on provided fields
        updates = []
        values = []
        allowed_fields = ['name', 'phone', 'cgpa', 'skills']

        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            return jsonify({'error': 'No fields to update'}), 400

        values.append(student_id)
        query = f"UPDATE students SET {', '.join(updates)} WHERE student_id = %s"

        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({'message': 'Student updated successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@student_bp.route('/api/students/<int:student_id>', methods=['DELETE'])
@admin_required
def delete_student(current_user, student_id):
    """
    Delete a student record. Admin-only endpoint.
    Cascades to delete associated applications (FK constraint).
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM students WHERE student_id = %s", (student_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({'message': 'Student deleted successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
