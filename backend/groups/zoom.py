import datetime
import logging

import requests
from django.conf import settings

from .base import BaseMeetingService, MeetingProviderError

logger = logging.getLogger(__name__)


class ZoomMeetingService(BaseMeetingService):
    provider_key = 'zoom'

    def create_meeting(self, group, scheduled_at, user):
        token = self._get_access_token()

        payload = {
            'topic': f"{group.name} Study Session",
            'type': 2 if scheduled_at else 1,  # 2 = scheduled, 1 = instant
            'settings': {
                # TODO: make this configurable per-group once you have a
                # notion of "moderator". Defaulting to the safer option
                # since there's no host concept yet for peer study groups.
                'join_before_host': False,
                'waiting_room': True,
            },
        }

        if scheduled_at:
            utc_time = scheduled_at.astimezone(datetime.timezone.utc)
            payload['start_time'] = utc_time.strftime('%Y-%m-%dT%H:%M:%SZ')
            payload['timezone'] = 'UTC'

        resp = requests.post(
            'https://api.zoom.us/v2/users/me/meetings',
            json=payload,
            headers={'Authorization': f'Bearer {token}'},
            timeout=10,
        )

        if resp.status_code != 201:
            logger.exception(
                "Zoom meeting creation failed (status=%s, body=%s)",
                resp.status_code, resp.text,
            )
            raise MeetingProviderError("Zoom meeting creation failed.")

        return resp.json()['join_url']

    def _get_access_token(self):
        resp = requests.post(
            'https://zoom.us/oauth/token',
            params={
                'grant_type': 'account_credentials',
                'account_id': settings.ZOOM_ACCOUNT_ID,
            },
            auth=(settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET),
            timeout=10,
        )
        if resp.status_code != 200:
            logger.exception("Zoom auth failed (status=%s, body=%s)", resp.status_code, resp.text)
            raise MeetingProviderError("Zoom authentication failed.")
        return resp.json()['access_token']