# =============================================================================
# Authentication Routes — Register & Login
# =============================================================================
# POST /api/register — Create a new user (student) account
# POST /api/login    — Authenticate and return a JWT token
# =============================================================================

from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import datetime
from db import get_connection
from config import JWT_SECRET_KEY, JWT_EXPIRY_HOURS

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/register', methods=['POST'])
def register():
    """
    Register a new student user.
    Expects JSON: { name, email, password, phone, cgpa, skills }
    Steps:
      1. Hash the password with bcrypt
      2. Insert into users table (role = 'student')
      3. Insert into students table with profile details
    """
    data = request.get_json()

    # Validate required fields
    required = ['name', 'email', 'password', 'phone', 'cgpa']
    for field in required:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Check if email already exists in users table
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'Email already registered'}), 409

        # Hash the password using bcrypt
        password_hash = bcrypt.hashpw(
            data['password'].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # Insert into users table
        cursor.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, 'student')",
            (data['email'], password_hash)
        )
        user_id = cursor.lastrowid

        # Insert into students table
        cursor.execute(
            """INSERT INTO students (user_id, name, email, phone, cgpa, skills)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, data['name'], data['email'], data['phone'],
             float(data['cgpa']), data.get('skills', ''))
        )

        conn.commit()
        return jsonify({'message': 'Registration successful', 'user_id': user_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/api/login', methods=['POST'])
def login():
    """
    Authenticate a user and return a JWT token.
    Expects JSON: { email, password }
    Returns: { token, role, user_id, student_id? }
    """
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch user by email
        cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        # Verify password with bcrypt
        if not bcrypt.checkpw(data['password'].encode('utf-8'),
                              user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid email or password'}), 401

        # If the user is a student, also fetch their student_id
        student_id = None
        if user['role'] == 'student':
            cursor.execute(
                "SELECT student_id FROM students WHERE user_id = %s",
                (user['user_id'],)
            )
            student = cursor.fetchone()
            if student:
                student_id = student['student_id']

        # Generate JWT token with expiry
        payload = {
            'user_id': user['user_id'],
            'email': user['email'],
            'role': user['role'],
            'student_id': student_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
        }
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'role': user['role'],
            'user_id': user['user_id'],
            'student_id': student_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
