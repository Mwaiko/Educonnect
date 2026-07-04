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


def notify_new_answer(question, answer):
    """Notify the question's author that a new answer was posted.

    Skipped if the author answered their own question — no point
    notifying someone about their own action.
    """
    if question.author_id == answer.author_id:
        return None

    return send_notification(
        recipient=question.author,
        notification_type='new_answer',
        payload={
            'question_id': str(question.id),
            'question_title': question.title,
            'answer_id': str(answer.id),
            'answer_author_id': str(answer.author_id),
            'answer_author_username': answer.author.first_name,
            'answer_preview': answer.body[:200],
        },
    )


def notify_answer_endorsed(answer):
    """Notify an answer's author that their answer was endorsed by an
    Expert Solver or admin."""
    return send_notification(
        recipient=answer.author,
        notification_type='answer_endorsed',
        payload={
            'question_id': str(answer.question_id),
            'question_title': answer.question.title,
            'answer_id': str(answer.id),
        },
    )


def notify_answer_accepted(answer):
    """Notify an answer's author that the question author accepted their
    answer."""
    return send_notification(
        recipient=answer.author,
        notification_type='answer_accepted',
        payload={
            'question_id': str(answer.question_id),
            'question_title': answer.question.title,
            'answer_id': str(answer.id),
        },
    )