# =============================================================================
# Configuration for the Flask backend
# =============================================================================
# Contains MySQL connection parameters and JWT settings.
# Update MYSQL_PASSWORD with your local MySQL root password.
# =============================================================================

import os

# ─── MySQL Database Configuration ───
MYSQL_HOST     = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_USER     = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'password')  # <-- Set your MySQL password here
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'placement_db')

# ─── JWT Configuration ───
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'placement-system-secret-key-2024')
JWT_EXPIRY_HOURS = 24
