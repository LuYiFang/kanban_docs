from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import initialize_collections
from routes import tasks, properties

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = '/api'
app.include_router(tasks.router, prefix=prefix + '/task', tags=["tasks"])
app.include_router(properties.router, prefix=prefix + '/property',
                   tags=["properties"])


@app.on_event("startup")
async def on_startup():
    await initialize_collections()


@app.get("/")
async def root():
    return {"message": "Hello World!"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run('main:app', host="127.0.0.1", port=9000, reload=True)
