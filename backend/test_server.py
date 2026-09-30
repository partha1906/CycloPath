import sys
import traceback

try:
    import uvicorn
    from fastapi import FastAPI
    app = FastAPI()
    print("Attempting to run uvicorn server on port 8000...", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=8000)
except BaseException as e:
    print(f"Caught BaseException: {type(e)} -> {e}", flush=True)
    traceback.print_exc()
