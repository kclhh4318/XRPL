from pymongo import MongoClient
import json
import math

client = MongoClient('mongodb://localhost:27017/')  # localhost에 MongoDB가 실행 중인 경우

db = client['hyblock']
nft_collection = db['nft-collection-data']
nft_collection_rank = db['nft-collection-rank']

def insert_data():
    nft_collection.delete_many({}) 
    with open('merged_data.json', 'r') as file:
        data = json.load(file)['data']

    # name, bio, floor_price, picture_url
    filtered_data = [
        {
            'collection_id': item.get('id'),
            'name': item.get('name'),
            'bio': item.get('bio'),
            'floor_price': item.get('floor_price'),
            'total_volume': item.get('total_volume'),
            'value': math.log(float(item.get('floor_price')) + 1) * math.log(float(item.get('total_volume')) + 1)  # fp * log(total_volume + 1)
        }
        for item in data
    ]

    result = nft_collection.insert_many(filtered_data)
    print(f"Data inserted with id: {result.inserted_ids}")

def get_top_100_nfts():
    nft_collection_rank.delete_many({}) 
    top_nfts = list(nft_collection.find().sort([("value", -1)]).limit(100))
    filtered_data = [
        {
            'rank': rank + 1,
            'collection_id': item.get('collection_id'),
            'name': item.get('name'),
            'bio': item.get('bio'),
            'floor_price': item.get('floor_price'),
            'total_volume': item.get('total_volume'),
            'value': math.log(float(item.get('floor_price')) + 1) * math.log(float(item.get('total_volume')) + 1)  # fp * log(total_volume + 1)
        }
        for rank, item in enumerate(top_nfts)
    ]

    result = nft_collection_rank.insert_many(filtered_data)
    print(f"Data inserted with id: {result.inserted_ids}")

if __name__ == "__main__":
    insert_data()
    get_top_100_nfts()