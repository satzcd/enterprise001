from flask import Blueprint, jsonify

from app.controllers.review_controller import (
    create_review,
    delete_review,
    list_reviews_by_product,
    show_review,
    update_review,
)

review_bp = Blueprint("reviews", __name__)


@review_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


@review_bp.route("/reviews/product/<int:product_id>", methods=["GET"])
def product_reviews(product_id):
    return list_reviews_by_product(product_id)


@review_bp.route("/reviews/<string:review_id>", methods=["GET"])
def review_detail(review_id):
    return show_review(review_id)


@review_bp.route("/reviews", methods=["POST"])
def create():
    return create_review()


@review_bp.route("/reviews/<string:review_id>", methods=["PUT"])
def update(review_id):
    return update_review(review_id)


@review_bp.route("/reviews/<string:review_id>", methods=["DELETE"])
def delete(review_id):
    return delete_review(review_id)
