class AsyncMongoMockWrapper:
    def __init__(self, db):
        self.db = db

    def __getitem__(self, name):
        collection = self.db[name]
        return AsyncMongoCollectionMock(self.db, collection)

    def get_collection(self, name):
        collection = self.db[name]
        return AsyncMongoCollectionMock(collection)


class AsyncMongoCursorMock:
    def __init__(self, results):
        self.results = results

    async def to_list(self, length=None):
        if length:
            return self.results[:length]
        return self.results


class AsyncMongoCollectionMock:
    def __init__(self, db, collection):
        self.db = db
        self.collection = collection

    def __getattr__(self, name):
        async def method(*args, **kwargs):
            func = getattr(self.collection, name, None)

            if func is None:
                raise AttributeError(
                    f"'{type(self.collection).__name__}' object has no attribute '{name}'")
            return func(*args, **kwargs)

        return method

    def aggregate(self, pipeline):
        documents = [doc for doc in self.collection.find({})]
        updated_at_values = []

        for doc in documents:
            if "updatedAt" in doc and doc["updatedAt"] is not None:
                updated_at_values.append(doc["updatedAt"])

            properties = self.db['properties'].find({'taskId': doc['_id']})
            properties = [prop for prop in properties]

            for prop in properties:
                if prop['name'] == 'updatedAt':
                    updated_at_values.append(prop["updatedAt"])
                prop['id'] = prop['_id']
                del prop['_id']

            max_updated_at = max(
                updated_at_values) if updated_at_values else None
            doc['updatedAt'] = max_updated_at
            doc['properties'] = properties
            doc['id'] = doc['_id']
            del doc['_id']

        return AsyncMongoCursorMock(documents)
