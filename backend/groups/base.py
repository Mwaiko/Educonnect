import logging

logger = logging.getLogger(__name__)


class MeetingProviderError(Exception):
    """Raised when a meeting provider (Zoom, Google, etc.) fails to create a meeting."""
    pass


class BaseMeetingService:
    provider_key = None

    def create_meeting(self, group, scheduled_at, user):
        raise NotImplementedError