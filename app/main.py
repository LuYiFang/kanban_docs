from fastapi import FastAPI
from routes import tasks

app = FastAPI()

app.include_router(tasks.router, prefix="/api/v1", tags=["tasks"])


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI + MongoDB + File System!"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run('main:app', host="127.0.0.1", port=9000, reload=True)
