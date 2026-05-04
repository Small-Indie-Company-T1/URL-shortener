from unittest.mock import MagicMock, patch
import uuid

import pytest

from src.services.analytics import log_click_task, get_real_ip


@pytest.mark.asyncio
async def test_log_click_task_exception():
    mock_pool = MagicMock()
    mock_pool.acquire.side_effect = Exception("Fail")
    link_id = uuid.uuid4()
    with patch("src.services.analytics.logger") as mock_logger:
        await log_click_task(
            pool=mock_pool,
            link_id=link_id,
            user_agent='test',
            referer='test',
            ip_address='127.0.0.1'
        )
        mock_logger.error.assert_called_once()      
        args, _ = mock_logger.error.call_args
        assert f'Background task failed: log click for link {link_id}' in args[0]

def test_get_real_ip_branches():
    req_forwarded = MagicMock()
    req_forwarded.headers = {"x-forwarded-for": "1.2.3.4, 5.6.7.8"}
    assert get_real_ip(req_forwarded) == '1.2.3.4'

    req_client = MagicMock()
    req_client.headers = {}
    req_client.client.host = "192.168.1.50"
    assert get_real_ip(req_client) == "192.168.1.50"

    req_none = MagicMock()
    req_none.headers = {}
    req_none.client = None
    assert get_real_ip(req_none) == "127.0.0.1"
