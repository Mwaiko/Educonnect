"""
Companion to tags/migrations/0001_initial.py — removes Tag from forum's
migration state (the table itself already moved, physically, in that
migration) and repoints QuestionTag.tag / Question.tags at tags.Tag.

State-only: the forum_question_tags.tag_id column already points at the
same physical table (just renamed, same rows, same primary keys), so
there's no real database operation needed here — only Django's bookkeeping
of which app owns the referenced model needs to change.

Adjust `dependencies` if your forum app's migration history differs.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("forum", "0004_tag_hierarchy"),
        ("tag", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name="questiontag",
                    name="tag",
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="tag.tag"
                    ),
                ),
                migrations.AlterField(
                    model_name="question",
                    name="tags",
                    field=models.ManyToManyField(
                        blank=True,
                        related_name="questions",
                        through="forum.QuestionTag",
                        to="tag.tag",
                    ),
                ),
                migrations.DeleteModel(name="Tag"),
            ],
            database_operations=[],
        ),
    ]