from app.exceptions import ValidationError


def validate_review_data(data):
    if not isinstance(data, dict):
        raise ValidationError("Request body harus berupa JSON object")

    validated = {}

    for field in ("product_id", "user_id"):
        value = data.get(field)

        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            raise ValidationError(
                f"{field} harus berupa bilangan bulat minimal 1"
            )

        validated[field] = value

    rating = data.get("rating")

    if isinstance(rating, bool) or not isinstance(rating, int) or not 1 <= rating <= 5:
        raise ValidationError("rating harus berupa bilangan bulat dari 1 sampai 5")

    validated["rating"] = rating

    comment = data.get("comment", "")

    if not isinstance(comment, str):
        raise ValidationError("comment harus berupa string")

    if len(comment) > 1000:
        raise ValidationError("comment maksimal 1000 karakter")

    validated["comment"] = comment

    return validated
