from xrpl.asyncio.clients import AsyncJsonRpcClient
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import sign_and_submit
from xrpl.wallet import Wallet
import logging
from fastapi import FastAPI, APIRouter, HTTPException
from xrpl.asyncio.clients import AsyncJsonRpcClient
from xrpl.models.requests.account_nfts import AccountNFTs
import httpx
from pymongo import MongoClient
import json
import math
import asyncio
from pydantic import BaseModel
import random


# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# XRPL 노드 URL (메인넷)
JSON_RPC_URL = "https://s.altnet.rippletest.net:51234"
client = AsyncJsonRpcClient(JSON_RPC_URL)

# 외부 API URL
NFT_API_URL = "https://marketplace-api.onxrp.com/api/nfts/{}"

mongo_client = MongoClient('mongodb://localhost:27017/')  # localhost에 MongoDB가 실행 중인 경우

db = mongo_client['hyblock']
nft_collection_rank = db['nft-collection-rank']

@router.get("/get-nfts-list/{wallet_address}")
async def get_nfts_from_wallet_address(wallet_address: str):
    """
    주어진 지갑 주소에서 보유한 NFT 목록을 가져옵니다.

    :param wallet_address: XRP 지갑 주소
    :return: NFT 목록
    """
    account_nfts_request = AccountNFTs(
        account=wallet_address,
        ledger_index="validated"
    )

    response = await client.request(account_nfts_request)

    if response.is_successful():
        nfts = response.result.get("account_nfts", [])
        logger.info(f"Retrieved {len(nfts)} NFTs from wallet address: {wallet_address}")
        return nfts
    else:
        logger.error(f"Failed to retrieve NFTs: {response.result.get('error_message', 'Unknown error')}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve NFTs: {response.result.get('error_message', 'Unknown error')}")

@router.get("/get-nft-data/{token_address}")
async def fetch_nft_data(nft_token: str):
    """
    주어진 NFT token_id로 외부 API를 호출하여 floor_price와 picture_url, name을 가져옵니다.

    :param nft_token: NFT의 token_id
    :return: floor_price, picture_url, name을 포함한 데이터
    """
    async with httpx.AsyncClient(timeout=10) as client:
        logger.info(f"Fetching data for NFT token: {nft_token}")
        response = await client.get(NFT_API_URL.format(nft_token))

        if response.status_code == 200:
            nft_data = response.json()
            floor_price = nft_data["data"]["collection"]["floor_price"]
            picture_url = "https://marketplace-image.onxrp.com/?uri=" + nft_data["data"]["ipfs_url"]
            name = nft_data["data"]["name"]

            logger.info(f"Fetched data for NFT token: {nft_token} - Name: {name}, Floor Price: {floor_price}")
            
            try: 
                rank = nft_collection_rank.find_one({"collection_id": nft_data["data"]["collection_id"]}).get("rank")
                tier = tier_generator(rank)
            except:
                rank = 101
                tier = 5

            return {
                "name": name,
                "floor_price": floor_price,
                "collection_id": nft_data["data"]["collection_id"],
                "picture_url": picture_url,
                "tier": tier,
                "rank": rank
            }
        
        else:
            return {}

@router.get("/get-nft-rank")
async def fetch_nft_rank():
    pass



def tier_generator(rank):
    if 1 <= rank <= 10:
        tier = 1
    elif 11 <= rank <= 30:
        tier = 2
    elif 31 <= rank <= 50:
        tier = 3
    elif 51 <= rank <= 100:
        tier = 4
    else:
        tier = 5

    return tier



@router.get("/get-nfts/{wallet_address}")
async def get_nfts(wallet_address: str):
    """
    주어진 지갑 주소에서 보유한 NFT 목록을 반환하고, 각각의 NFT에 대해 추가 정보를 외부 API에서 조회하여 반환합니다.

    :param wallet_address: XRP 지갑 주소
    :return: floor_price, picture_url, name이 포함된 NFT 목록
    """

    nfts = await get_nfts_from_wallet_address(wallet_address)

    if not nfts:
        return {"message": "No NFTs found in the wallet."}

    tasks = [fetch_nft_data(nft["NFTokenID"]) for nft in nfts]
    nft_details = await asyncio.gather(*tasks)

    logger.info(f"Retrieved details for {len(nft_details)} NFTs")

    return {"nfts": nft_details}




SYSTEM_WALLET_SEED = "sEd7j2tbJYXAYdfTBv7xbGpnyNjsRvG"
TOKEN_ISSUER = Wallet.from_seed(SYSTEM_WALLET_SEED).classic_address  # NBL 토큰을 발행한 주소
TOKEN_NAME = "NBL"

# FastAPI 모델 정의
class BetRequest(BaseModel):
    user_wallet_seed: str
    bet_amount: int

class GameResultRequest(BaseModel):
    user_wallet_seed: str
    bet_amount: int
    user_won: bool

async def setup_client():
    client = AsyncJsonRpcClient("https://s.altnet.rippletest.net:51234")
    return client

async def transfer_tokens(client, source_wallet, destination_address, amount):
    payment = Payment(
        account=source_wallet.classic_address,
        amount={
            "currency": TOKEN_NAME,
            "issuer": TOKEN_ISSUER,
            "value": str(amount)
        },
        destination=destination_address
    )

    response = await sign_and_submit(payment, client, source_wallet)
    return response


@router.post("/resolve_bet")
async def resolve_bet(request: GameResultRequest):
    client = await setup_client()

    try:
        # 유저 월렛 생성
        user_wallet = request.user_wallet_seed
        system_wallet = Wallet.from_seed(SYSTEM_WALLET_SEED)

        if request.user_won:
            payout_amount = request.bet_amount
            payout_result = await transfer_tokens(client, system_wallet, user_wallet, payout_amount)
            return {"result": "User won", "payout": payout_result}
        else:
            return {"result": "User lost", "payout": "No payout"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
