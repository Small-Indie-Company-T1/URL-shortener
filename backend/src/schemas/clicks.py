from ipaddress import IPv4Address, IPv6Address
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class ClickRead(BaseModel):
    id: UUID
    link_id: UUID
    user_agent: Optional[str]
    referred_from: Optional[str]
    ip_address: IPv4Address | IPv6Address
    clicked_at: datetime