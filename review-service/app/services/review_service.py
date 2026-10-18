from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.clients.product_client import get_product
from app.exceptions import (
    DuplicateReviewError,
    ReviewNotFoundError,
)
from app.models.review_model import ensure_review_indexes
from app.models.review_model import (
    create_review,
    delete_review,
    get_review_by_id,
    get_reviews_by_product,
    update_review,
)
from app.schemas.review_schema import validate_review_data


def list_product_reviews(product_id):
    ensure_review_indexes()
    return get_reviews_by_product(product_id)


def get_review(review_id):
    ensure_review_indexes()
    review = get_review_by_id(review_id)

    if review is None:
        raise ReviewNotFoundError()

    return review


def add_review(data):
    ensure_review_indexes()
    validated = validate_review_data(data)

    get_product(validated["product_id"])

    now = datetime.now(timezone.utc).isoformat()
    validated["created_at"] = now
    validated["updated_at"] = now

    try:
        return create_review(validated)
    except DuplicateKeyError as exc:
        raise DuplicateReviewError() from exc


def edit_review(review_id, data):
    ensure_review_indexes()
    existing = get_review_by_id(review_id)

    if existing is None:
        raise ReviewNotFoundError()

    if not isinstance(data, dict):
        from app.exceptions import ValidationError
        raise ValidationError("Request body harus berupa JSON object")

    updated_fields = {}

    if "rating" in data:
        rating = data["rating"]
        if (
            isinstance(rating, bool)
            or not isinstance(rating, int)
            or not 1 <= rating <= 5
        ):
            from app.exceptions import ValidationError
            raise ValidationError(
                "rating harus berupa bilangan bulat dari 1 sampai 5"
            )
        updated_fields["rating"] = rating

    if "comment" in data:
        comment = data["comment"]
        if not isinstance(comment, str):
            from app.exceptions import ValidationError
            raise ValidationError("comment harus berupa string")
        if len(comment) > 1000:
            from app.exceptions import ValidationError
            raise ValidationError("comment maksimal 1000 karakter")
        updated_fields["comment"] = comment

    if not updated_fields:
        from app.exceptions import ValidationError
        raise ValidationError("Tidak ada field rating atau comment yang valid")

    updated_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    updated = update_review(review_id, updated_fields)

    if updated is None:
        raise ReviewNotFoundError()

    return updated


def remove_review(review_id):
    ensure_review_indexes()
    if not delete_review(review_id):
        raise ReviewNotFoundError()

    return {"message": "Review berhasil dihapus"}
