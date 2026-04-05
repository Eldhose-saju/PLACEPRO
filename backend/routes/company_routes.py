# =============================================================================
# Company Routes — CRUD Operations (Admin-controlled)
# =============================================================================
# GET    /api/companies      — List all companies
# POST   /api/companies      — Add a new company (admin only)
# PUT    /api/companies/<id> — Update company (admin only)
# DELETE /api/companies/<id> — Delete company (admin only)
# =============================================================================

from flask import Blueprint, request, jsonify
from db import get_connection
from auth import token_required, admin_required

company_bp = Blueprint('companies', __name__)


@company_bp.route('/api/companies', methods=['GET'])
@token_required
def get_all_companies(current_user):
    """
    Fetch all companies from the database.
    Accessible by both students and admins.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM companies ORDER BY company_id ASC")
        companies = cursor.fetchall()

        # Convert datetime to ISO format
        for c in companies:
            c['created_at'] = c['created_at'].isoformat() if c.get('created_at') else None

        return jsonify(companies), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@company_bp.route('/api/companies', methods=['POST'])
@admin_required
def add_company(current_user):
    """
    Add a new company. Admin-only endpoint.
    Expects JSON: { name, location }
    """
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Company name is required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO companies (name, location) VALUES (%s, %s)",
            (data['name'], data.get('location', ''))
        )
        conn.commit()

        return jsonify({
            'message': 'Company added successfully',
            'company_id': cursor.lastrowid
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@company_bp.route('/api/companies/<int:company_id>', methods=['PUT'])
@admin_required
def update_company(current_user, company_id):
    """
    Update an existing company. Admin-only endpoint.
    """
    data = request.get_json()

    try:
        conn = get_connection()
        cursor = conn.cursor()

        updates = []
        values = []
        for field in ['name', 'location']:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            return jsonify({'error': 'No fields to update'}), 400

        values.append(company_id)
        query = f"UPDATE companies SET {', '.join(updates)} WHERE company_id = %s"

        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Company not found'}), 404

        return jsonify({'message': 'Company updated successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@company_bp.route('/api/companies/<int:company_id>', methods=['DELETE'])
@admin_required
def delete_company(current_user, company_id):
    """
    Delete a company. Admin-only endpoint.
    Cascading delete will also remove associated jobs and applications.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM companies WHERE company_id = %s", (company_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Company not found'}), 404

        return jsonify({'message': 'Company deleted successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
