import datetime
import logging

from django.conf import settings
from django.utils import timezone as dj_timezone

from .base import BaseMeetingService, MeetingProviderError

logger = logging.getLogger(__name__)


class GoogleMeetService(BaseMeetingService):
    provider_key = 'google_meet'

    def create_meeting(self, group, scheduled_at, user):
        from googleapiclient.discovery import build

        creds = self._get_credentials(user)
        service = build('calendar', 'v3', credentials=creds)

        start_time = scheduled_at or dj_timezone.now()
        end_time = start_time + datetime.timedelta(hours=1)

        attendees = self._get_attendees(group)

        event_body = {
            'summary': f"{group.name} Study Session",
            'start': {'dateTime': start_time.isoformat()},
            'end': {'dateTime': end_time.isoformat()},
            'attendees': attendees,
            'conferenceData': {
                'createRequest': {
                    'requestId': f"group-{group.id}-{int(start_time.timestamp())}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'},
                }
            },
        }

        try:
            event = service.events().insert(
                calendarId='primary',
                body=event_body,
                conferenceDataVersion=1,
                sendUpdates='all',
            ).execute()
        except Exception:
            logger.exception("Google Meet creation failed for group_id=%s", group.id)
            raise MeetingProviderError("Google Meet creation failed.")

        return event['hangoutLink']

    def _get_attendees(self, group):
        from .models import Membership  # adjust import path to your app

        members = Membership.objects.filter(group=group).select_related('user')
        return [{'email': m.user.email} for m in members if m.user.email]

    def _get_credentials(self, user):
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials

        token_obj = user.google_oauth_token  # <- adjust to your actual relation/model

        creds = Credentials(
            token=token_obj.access_token,
            refresh_token=token_obj.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
        )

        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception:
                logger.exception(
                    "Failed to refresh Google credentials for user_id=%s", user.id
                )
                raise MeetingProviderError(
                    "Your Google account needs to be reconnected."
                )
            token_obj.access_token = creds.token
            token_obj.save(update_fields=['access_token'])

        return creds