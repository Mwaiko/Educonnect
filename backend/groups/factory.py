from .base import MeetingProviderError
from .google import GoogleMeetService
from .zoom import ZoomMeetingService

_SERVICES = {
    ZoomMeetingService.provider_key: ZoomMeetingService,
    GoogleMeetService.provider_key: GoogleMeetService,
}


def get_meeting_service(provider):
    service_cls = _SERVICES.get(provider)
    if service_cls is None:
        raise MeetingProviderError(f"Unsupported provider: {provider}")
    return service_cls()