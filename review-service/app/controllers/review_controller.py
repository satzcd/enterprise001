from flask import jsonify, request

from app.services.review_service import (
    add_review,
    edit_review,
    get_review,
    list_product_reviews,
    remove_review,
)


def list_reviews_by_product(product_id):
    result = list_product_reviews(product_id)
    return jsonify(result), 200


def show_review(review_id):
    result = get_review(review_id)
    return jsonify(result), 200


def create_review():
    data = request.get_json(silent=True)
    result = add_review(data)
    return jsonify(result), 201


def update_review(review_id):
    data = request.get_json(silent=True)
    result = edit_review(review_id, data)
    return jsonify(result), 200


def delete_review(review_id):
    result = remove_review(review_id)
    return jsonify(result), 200
