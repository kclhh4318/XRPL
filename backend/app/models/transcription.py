from pydantic import BaseModel
from typing import List

class Segment(BaseModel):
    id: int
    text: str
    start: float
    end: float

class Transcription(BaseModel):
    full_text: str
    segments: List[Segment]