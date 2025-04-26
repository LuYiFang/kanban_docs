from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import mongodb
from routes import tasks, properties, tasks_with_properties, files

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
app.include_router(tasks_with_properties.router, prefix=prefix,
                   tags=["tasks_with_properties"])
app.include_router(files.router, prefix=prefix + '/files',
                   tags=["files"])


@app.on_event("startup")
async def startup_event():
    await mongodb.connect()
    await mongodb.initialize_collections()


@app.on_event("shutdown")
async def shutdown_event():
    await mongodb.disconnect()


@app.get("/")
async def root():
    return {"message": "Hello World!"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run('main:app', host="127.0.0.1", port=9000, reload=True)
