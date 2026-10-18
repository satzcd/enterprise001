import os
import requests

from app.exceptions import (
    ProductNotFoundError,
    ProductServiceUnavailableError,
)


def get_product(product_id):
    base_url = os.getenv(
        "PRODUCT_SERVICE_URL",
        "http://product-service:3000"
    ).rstrip("/")

    try:
        response = requests.get(
            f"{base_url}/products/{product_id}",
            timeout=3
        )
    except requests.RequestException as exc:
        raise ProductServiceUnavailableError() from exc

    if response.status_code == 404:
        raise ProductNotFoundError()

    if response.status_code >= 500:
        raise ProductServiceUnavailableError()

    if not response.ok:
        raise ProductServiceUnavailableError(
            "Product Service mengembalikan respons yang tidak valid"
        )

    try:
        product = response.json()
    except ValueError as exc:
        raise ProductServiceUnavailableError(
            "Respons Product Service bukan JSON yang valid"
        ) from exc

    if not isinstance(product, dict):
        raise ProductServiceUnavailableError(
            "Format respons Product Service tidak valid"
        )

    return product
