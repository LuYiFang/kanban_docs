import time

import docker


def start_mongo_container():
    """啟動 MongoDB 容器"""

    client = docker.from_env()

    # 檢查是否已經有運行中的 MongoDB 容器
    existing_container = next(
        (c for c in client.containers.list() if "test-mongo" in c.name), None)

    if not existing_container:
        print("🚀 啟動 MongoDB container...")
        container = client.containers.run(
            "mongo:6.0",
            name="test-mongo",
            ports={"27017/tcp": 27018},
            detach=True
        )
        time.sleep(5)  # 等待 MongoDB 啟動
    else:
        container = existing_container
        print("✅ MongoDB container 已在運行")

    print(f"MongoDB container 運行中... {container.id}")
    return container


def stop_mongo_container(container):
    """停止並刪除 MongoDB 容器"""
    container.stop()
    container.remove()
    print("MongoDB 容器已停止並刪除")
