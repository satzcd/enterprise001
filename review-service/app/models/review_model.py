from bson import ObjectId
from pymongo import ASCENDING, ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database import reviews_collection


_indexes_ready = False


def ensure_review_indexes():
    global _indexes_ready

    if _indexes_ready:
        return

    reviews_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("product_id", ASCENDING),
        ],
        unique=True,
    )

    _indexes_ready = True


def serialize_review(review):
    if review is None:
        return None

    return {
        "id": str(review["_id"]),
        "product_id": review["product_id"],
        "user_id": review["user_id"],
        "rating": review["rating"],
        "comment": review.get("comment", ""),
        "created_at": review.get("created_at"),
        "updated_at": review.get("updated_at"),
    }


def create_review(data):
    try:
        result = reviews_collection.insert_one(data)
    except DuplicateKeyError:
        raise

    return serialize_review(
        reviews_collection.find_one({"_id": result.inserted_id})
    )


def get_review_by_id(review_id):
    if not ObjectId.is_valid(review_id):
        return None

    review = reviews_collection.find_one(
        {"_id": ObjectId(review_id)}
    )
    return serialize_review(review)


def get_reviews_by_product(product_id):
    reviews = [
        serialize_review(review)
        for review in reviews_collection.find(
            {"product_id": product_id}
        ).sort("_id", ASCENDING)
    ]

    average_rating = (
        round(sum(review["rating"] for review in reviews) / len(reviews), 2)
        if reviews
        else 0
    )

    return {
        "product_id": product_id,
        "total_reviews": len(reviews),
        "average_rating": average_rating,
        "reviews": reviews,
    }


def update_review(review_id, data):
    if not ObjectId.is_valid(review_id):
        return None

    updated = reviews_collection.find_one_and_update(
        {"_id": ObjectId(review_id)},
        {"$set": data},
        return_document=ReturnDocument.AFTER,
    )

    return serialize_review(updated)


def delete_review(review_id):
    if not ObjectId.is_valid(review_id):
        return False

    result = reviews_collection.delete_one(
        {"_id": ObjectId(review_id)}
    )

    return result.deleted_count > 0
from bson import ObjectId
from pymongo import ASCENDING, ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.database import reviews_collection


_indexes_ready = False


def ensure_review_indexes():
    global _indexes_ready

    if _indexes_ready:
        return

    reviews_collection.create_index(
        [
            ("user_id", ASCENDING),
            ("product_id", ASCENDING),
        ],
        unique=True,
    )

    _indexes_ready = True


def serialize_review(review):
    if review is None:
        return None

    return {
        "id": str(review["_id"]),
        "product_id": review["product_id"],
        "user_id": review["user_id"],
        "rating": review["rating"],
        "comment": review.get("comment", ""),
        "created_at": review.get("created_at"),
        "updated_at": review.get("updated_at"),
    }


def create_review(data):
    try:
        result = reviews_collection.insert_one(data)
    except DuplicateKeyError:
        raise

    return serialize_review(
        reviews_collection.find_one({"_id": result.inserted_id})
    )


def get_review_by_id(review_id):
    if not ObjectId.is_valid(review_id):
        return None

    review = reviews_collection.find_one(
        {"_id": ObjectId(review_id)}
    )
    return serialize_review(review)


def get_reviews_by_product(product_id):
    reviews = [
        serialize_review(review)
        for review in reviews_collection.find(
            {"product_id": product_id}
        ).sort("_id", ASCENDING)
    ]

    average_rating = (
        round(sum(review["rating"] for review in reviews) / len(reviews), 2)
        if reviews
        else 0
    )

    return {
        "product_id": product_id,
        "total_reviews": len(reviews),
        "average_rating": average_rating,
        "reviews": reviews,
    }


def update_review(review_id, data):
    if not ObjectId.is_valid(review_id):
        return None

    updated = reviews_collection.find_one_and_update(
        {"_id": ObjectId(review_id)},
        {"$set": data},
        return_document=ReturnDocument.AFTER,
    )

    return serialize_review(updated)


def delete_review(review_id):
    if not ObjectId.is_valid(review_id):
        return False

    result = reviews_collection.delete_one(
        {"_id": ObjectId(review_id)}
    )

    return result.deleted_count > 0
