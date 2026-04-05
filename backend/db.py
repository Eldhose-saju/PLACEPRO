# =============================================================================
# Database Connection Helper
# =============================================================================
# Provides a reusable get_connection() function using mysql-connector-python.
# All routes use this to interact with the MySQL database.
# =============================================================================

import mysql.connector
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE


def get_connection():
    """
    Create and return a new MySQL database connection.
    Uses configuration values from config.py.
    Returns a mysql.connector connection object.
    """
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE
    )
