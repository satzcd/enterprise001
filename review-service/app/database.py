import os
from pymongo import MongoClient

mongo_client = MongoClient(
    os.getenv(
        "MONGO_URI",
        "mongodb://appuser:apppassword@review-db:27017/reviewdb?authSource=admin"
    ),
    serverSelectionTimeoutMS=3000
)

db = mongo_client[
    os.getenv("MONGO_DB", "reviewdb")
]

reviews_collection = db["reviews"]
