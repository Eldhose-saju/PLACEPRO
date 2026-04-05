# =============================================================================
# Flask Application Entry Point
# =============================================================================
# Registers all route blueprints, enables CORS, and starts the Flask server.
# =============================================================================

from flask import Flask
from flask_cors import CORS

# Import route blueprints
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.company_routes import company_bp
from routes.job_routes import job_bp
from routes.application_routes import application_bp
from routes.report_routes import report_bp

# ─── Initialize Flask app ───
app = Flask(__name__)

# ─── Enable CORS for all routes (allows Next.js frontend to call the API) ───
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Register Blueprints ───
app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(company_bp)
app.register_blueprint(job_bp)
app.register_blueprint(application_bp)
app.register_blueprint(report_bp)


# ─── Health check endpoint ───
@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check to verify the API is running."""
    return {'status': 'ok', 'message': 'College Placement Management System API is running'}, 200


# ─── Run the server ───
if __name__ == '__main__':
    print("=" * 60)
    print("  College Placement Management System — Flask API")
    print("  Running on http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
