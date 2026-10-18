class ReviewError(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ValidationError(ReviewError):
    def __init__(self, message):
        super().__init__(message, 422)


class ReviewNotFoundError(ReviewError):
    def __init__(self, message="Review tidak ditemukan"):
        super().__init__(message, 404)


class DuplicateReviewError(ReviewError):
    def __init__(self, message="User sudah memberikan review untuk produk ini"):
        super().__init__(message, 409)


class ProductNotFoundError(ReviewError):
    def __init__(self, message="Produk tidak ditemukan"):
        super().__init__(message, 422)


class ProductServiceUnavailableError(ReviewError):
    def __init__(self, message="Product Service tidak tersedia"):
        super().__init__(message, 503)
