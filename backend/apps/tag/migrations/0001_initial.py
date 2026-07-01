"""
Moves Tag from `forum` into its own `tags` app.

IMPORTANT — sequencing:
1. `forum`'s tag-hierarchy migration (adding slug/level/parent to
   forum_tag) must run FIRST — this migration depends on it and assumes
   those columns, the unique(parent, name) constraint, and the two
   indexes already exist on the table.
2. This migration does NOT recreate the table or its data. It:
   - physically renames forum_tag -> tags_tag (cheap metadata-only
     operation on Postgres, no data copy, no long lock)
   - tells Django's migration state that `tags.Tag` now owns that table,
     via SeparateDatabaseAndState so no real CREATE TABLE happens
3. Index/constraint names inside the table stay as `forum_tag_*` /
   `unique_tag_name_per_parent` — cosmetic only, Django doesn't diff
   against live DB object names, so there's no need to rename them and
   no functional impact either way.
4. A companion migration in `forum` (0the one right after this) removes
   Tag from forum's state and repoints QuestionTag.tag / Question.tags
   at `tags.Tag` — see that file for why it's also state-only.

Adjust the `dependencies` entry below to your actual forum migration name.
"""
import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("forum", "0004_tag_hierarchy"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="Tag",
                    fields=[
                        (
                            "id",
                            models.UUIDField(
                                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                            ),
                        ),
                        ("name", models.CharField(max_length=80)),
                        ("slug", models.SlugField(blank=True, max_length=100)),
                        (
                            "level",
                            models.CharField(
                                choices=[
                                    ("category", "Category"),
                                    ("subcategory", "Subcategory"),
                                    ("tag", "Tag"),
                                ],
                                default="tag",
                                max_length=20,
                            ),
                        ),
                        (
                            "parent",
                            models.ForeignKey(
                                blank=True,
                                null=True,
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="children",
                                to="tag.tag",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "tags_tag",
                        "ordering": ["level", "name"],
                    },
                ),
                migrations.AddConstraint(
                    model_name="tag",
                    constraint=models.UniqueConstraint(
                        fields=("parent", "name"), name="unique_tag_name_per_parent"
                    ),
                ),
                migrations.AddIndex(
                    model_name="tag",
                    index=models.Index(
                        fields=["parent", "level"], name="forum_tag_parent_level_idx"
                    ),
                ),
                migrations.AddIndex(
                    model_name="tag",
                    index=models.Index(fields=["slug"], name="forum_tag_slug_idx"),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="ALTER TABLE forum_tag RENAME TO tags_tag;",
                    reverse_sql="ALTER TABLE tags_tag RENAME TO forum_tag;",
                ),
            ],
        ),
    ]