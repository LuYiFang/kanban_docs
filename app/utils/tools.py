import inspect
import sys
from pprint import pprint


def dprint(name, value):
    caller_frame = inspect.currentframe().f_back
    print(caller_frame, flush=True)
    print(name, flush=True)
    pprint(value)
    sys.stdout.flush()
