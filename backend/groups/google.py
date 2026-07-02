import logging
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from google.apps import meet_v2
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from .base import BaseMeetingService, MeetingProviderError

logger = logging.getLogger(__name__)


class GoogleMeetService(BaseMeetingService):
    provider_key = 'google_meet'

    def create_meeting(self, group, scheduled_at, user) -> str:
        """
        Creates a direct Google Meet space using the native Google Meet REST API (v2).
        """
        # Fetch valid, auto-refreshed credentials
        creds = self._get_credentials(user)

        try:
            # Initialize the modern Spaces Service Client
            client = meet_v2.SpacesServiceClient(credentials=creds)
            
            # Formulate the request structure for a new meeting room
            request = meet_v2.CreateSpaceRequest(
                space=meet_v2.Space()
            )
            
            # Execute the API call
            response = client.create_space(request=request)

            # Return the direct meeting URL (e.g., https://meet.google.com/abc-defg-hij)
            return response.meeting_uri

        except Exception as e:
            logger.exception(
                "Google Meet REST API space creation failed for group_id=%s. Details: %s", 
                group.id, str(e)
            )
            raise MeetingProviderError("Google Meet space creation failed.")

    def _get_credentials(self, user) -> Credentials:
        """
        Retrieves, validates, and automatically refreshes the user's Google OAuth tokens.
        """
        try:
            token_obj = user.google_oauth_token
        except ObjectDoesNotExist:
            logger.error("Google Meet requested but admin_user_id=%s has no linked Google account", user.id)
            raise MeetingProviderError(
                "Google Meet isn't configured yet. The administrator needs to connect a Google account."
            )

        creds = Credentials(
            token=token_obj.access_token,
            refresh_token=token_obj.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_CLIENT_ID, # Fetches from your JSON config mapping
            client_secret=settings.GOOGLE_CLIENT_SECRET, # Fetches from your JSON config mapping
        )

        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                # Update and persist the new access token immediately
                token_obj.access_token = creds.token
                token_obj.save(update_fields=['access_token'])
            except Exception:
                logger.exception("Failed to refresh Google credentials for user_id=%s", user.id)
                raise MeetingProviderError("Your Google account credentials have expired. Please reconnect.")

        return creds