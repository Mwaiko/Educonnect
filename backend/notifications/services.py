from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification


def send_notification(recipient, notification_type, payload):
    """
    Creates a Notification record and pushes it in real-time
    over WebSocket to the recipient if they're connected.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        payload=payload
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{recipient.id}',
        {
            'type': 'notification_event',
            'notification_id': str(notification.id),
            'notification_type': notification.notification_type,
            'payload': notification.payload,
            'created_at': notification.created_at.isoformat(),
        }
    )

    return notification