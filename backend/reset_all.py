import bcrypt
import mysql.connector

new_hash = bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode('utf-8')

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password',
        database='placement_db'
    )
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = %s WHERE role = 'student'", (new_hash,))
    conn.commit()
    print(f"Successfully reset {cursor.rowcount} student passwords to 'password123'.")
    cursor.close()
    conn.close()
except Exception as e:
    print('DB Error:', e)
