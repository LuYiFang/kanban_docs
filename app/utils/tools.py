import inspect
import os
import sys
from datetime import datetime
from pprint import pprint

from fastapi import HTTPException

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def dprint(name, value):
    caller_frame = inspect.currentframe().f_back
    print(caller_frame, flush=True)
    print(name, flush=True)
    pprint(value)
    sys.stdout.flush()


def validate_exp(payload):
    if "exp" not in payload:
        raise HTTPException(status_code=401, detail="Token has no expiration")
    exp = datetime.utcfromtimestamp(payload["exp"])
    if exp < datetime.utcnow():
        raise HTTPException(status_code=401,
                            detail="Token has expired")
    return exp
