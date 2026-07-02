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
                'join_before_host': True,
                'waiting_room': False,
                'jbh_time': 0, # Allows joining at any time
            }
        }

        if scheduled_at:
            utc_time = scheduled_at.astimezone(datetime.timezone.utc)
            payload['start_time'] = utc_time.strftime('%Y-%m-%dT%H:%M:%SZ')
            payload['timezone'] = 'UTC'

        try:
            resp = requests.post(
                'https://api.zoom.us/v2/users/me/meetings',
                json=payload,
                headers={'Authorization': f'Bearer {token}'},
                timeout=10,
            )
        except requests.exceptions.RequestException:
            logger.exception("Zoom meeting creation request failed (group_id=%s)", group.id)
            raise MeetingProviderError("Could not reach Zoom to create the meeting.")

        if resp.status_code != 201:
            logger.error(
                "Zoom meeting creation failed (status=%s, body=%s)",
                resp.status_code, resp.text,
            )
            raise MeetingProviderError("Zoom meeting creation failed.")

        return resp.json()['join_url']

    def _get_access_token(self):
        try:
            resp = requests.post(
                'https://zoom.us/oauth/token',
                params={
                    'grant_type': 'account_credentials',
                    'account_id': settings.ZOOM_ACCOUNT_ID,
                },
                auth=(settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET),
                timeout=10,
            )
        except requests.exceptions.RequestException:
            logger.exception("Zoom auth request failed")
            raise MeetingProviderError("Could not reach Zoom to authenticate.")

        if resp.status_code != 200:
            logger.error("Zoom auth failed (status=%s, body=%s)", resp.status_code, resp.text)
            raise MeetingProviderError("Zoom authentication failed.")
        return resp.json()['access_token']