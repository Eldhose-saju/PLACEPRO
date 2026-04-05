# =============================================================================
# JWT Authentication Decorators
# =============================================================================
# Provides two decorators:
#   - @token_required  : Validates JWT from Authorization header
#   - @admin_required  : Additionally checks that the user role is 'admin'
# =============================================================================

from functools import wraps
from flask import request, jsonify
import jwt
from config import JWT_SECRET_KEY


def token_required(f):
    """
    Decorator that extracts and validates a JWT token from the
    Authorization header (format: 'Bearer <token>').
    On success, passes the decoded payload as 'current_user' to the route.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Extract token from the Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401

        try:
            # Decode the JWT token using the secret key
            current_user = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def admin_required(f):
    """
    Decorator that first validates the JWT token, then checks
    that the user's role is 'admin'. Returns 403 if not.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401

        try:
            current_user = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        # Check admin role
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        return f(current_user, *args, **kwargs)

    return decorated
