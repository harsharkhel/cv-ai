import os

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    enabled=os.getenv("TESTING", "").lower() not in ("1", "true", "yes"),
)


def get_user_id_key(request):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:20]
    return get_remote_address(request)
