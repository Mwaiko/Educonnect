"""
signals.py — Gamification hooks.

Connect these in GamificationConfig.ready() so points and streaks
are awarded automatically whenever the relevant events occur.

Usage in other apps: fire the custom signals below with `send()`.
"""
from django.dispatch import Signal, receiver

# Custom signals fired by other apps
question_posted = Signal()       # sender=Question instance, user=user
answer_submitted = Signal()      # sender=Answer instance, user=user
answer_endorsed = Signal()       # sender=Answer instance, user=answer.author
answer_accepted = Signal()       # sender=Answer instance, user=answer.author
resource_submitted = Signal()    # sender=Resource instance, user=user
resource_milestone = Signal()    # sender=Resource instance, user=resource.submitted_by
session_attended = Signal()      # sender=StudyGroup instance, user=attendee


def _award_and_record(user, event_type, description=""):
    from .services import award_points, record_participation
    award_points(user, event_type, description)
    record_participation(user)


@receiver(question_posted)
def on_question_posted(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.POST_QUESTION, "Posted a question")


@receiver(answer_submitted)
def on_answer_submitted(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.SUBMIT_ANSWER, "Submitted an answer")


@receiver(answer_endorsed)
def on_answer_endorsed(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.ANSWER_ENDORSED, "Answer endorsed by expert")


@receiver(answer_accepted)
def on_answer_accepted(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.ANSWER_ACCEPTED, "Answer marked as accepted")


@receiver(resource_submitted)
def on_resource_submitted(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.SUBMIT_RESOURCE, "Submitted a resource")


@receiver(resource_milestone)
def on_resource_milestone(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.RESOURCE_MILESTONE, "Resource reached 10 votes")


@receiver(session_attended)
def on_session_attended(sender, user, **kwargs):
    from .models import PointTransaction
    _award_and_record(user, PointTransaction.EventType.ATTEND_SESSION, "Attended study group session")
