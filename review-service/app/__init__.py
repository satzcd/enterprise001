from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from app.exceptions import ReviewError


def create_app():
    app = Flask(__name__)

    from app.routes.review_routes import review_bp

    app.register_blueprint(review_bp)

    @app.errorhandler(ReviewError)
    def handle_review_error(error):
        return jsonify({"error": error.message}), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({"error": error.name}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Terjadi kesalahan internal")
        return jsonify({"error": "Internal server error"}), 500

    return app