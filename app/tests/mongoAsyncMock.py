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
        documents = []
        for doc in self.collection.find({}):
            doc['id'] = str(doc['_id'])
            documents.append(doc)

        for stage in pipeline:
            if "$lookup" in stage:
                lookup = stage["$lookup"]
                foreign_collection = self.db[lookup["from"]]
                for doc in documents:
                    local_field_value = doc.get(lookup["localField"])
                    if local_field_value:
                        matches = [
                            foreign_doc
                            for foreign_doc in foreign_collection.find({})
                            if foreign_doc.get(
                                lookup["foreignField"]) == local_field_value
                        ]
                        new_matches = []
                        for match in matches:
                            match['id'] = str(match['_id'])
                            new_matches.append(match)
                        doc[lookup["as"]] = new_matches

            if "$unwind" in stage:
                path = stage["$unwind"]["path"].lstrip("$")
                preserve_null = stage["$unwind"].get(
                    "preserveNullAndEmptyArrays", False)
                new_documents = []
                for doc in documents:
                    if path in doc and isinstance(doc[path], list):
                        for item in doc[path]:
                            new_doc = doc.copy()
                            new_doc[path] = item
                            new_documents.append(new_doc)
                    elif preserve_null:
                        new_documents.append(doc)
                documents = new_documents

            if "$project" in stage:
                projection = stage["$project"]
                for doc in documents:
                    for key in list(doc.keys()):
                        if key not in projection or projection[key] == 0:
                            doc.pop(key, None)
                        elif isinstance(projection[key], str) and projection[
                            key].startswith("$"):
                            key_path = projection[key].lstrip("$")
                            if key == 'id':
                                key_path = 'id'
                            doc[key] = get_nested(doc, key_path)

        return AsyncMongoCursorMock(documents)


def get_nested(data, path, default=None):
    keys = path.split('.')
    for key in keys:
        if isinstance(data, dict) and key in data:
            data = data[key]
        else:
            return default
    return data
