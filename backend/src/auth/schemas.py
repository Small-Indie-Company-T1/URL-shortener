from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nickname: str

class UserReturn(BaseModel):
    id: int
    email: EmailStr
    nickname: str
    created_at: datetime

    class Config:
        from_attributes = True