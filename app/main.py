from fastapi import FastAPI

from database import initialize_collections
from routes import tasks, properties

app = FastAPI()

prefix = '/api'
app.include_router(tasks.router, prefix=prefix, tags=["tasks"])
app.include_router(properties.router, prefix=prefix, tags=["properties"])


@app.on_event("startup")
async def on_startup():
    await initialize_collections()


@app.get("/")
async def root():
    return {"message": "Hello World!"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run('main:app', host="127.0.0.1", port=9000, reload=True)
