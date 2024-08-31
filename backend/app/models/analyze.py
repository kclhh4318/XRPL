from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

class TextWithTimestamp(BaseModel):
    time_stamp: int
    text: str

class Segment(BaseModel):
    title: str
    time_stamp: str
    summarization: List[str]
    text_with_timestamp: List[TextWithTimestamp]

class Result(BaseModel):
    object_uuid: str
    video_url: str
    segments: List[Segment]