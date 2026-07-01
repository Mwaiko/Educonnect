
"""
Adds the Category -> Subcategory -> Tag hierarchy to forum_tag.

IMPORTANT — before running:
- Rename this file with the correct next migration number for your app
  (e.g. 0004_tag_hierarchy.py) and fix `dependencies` below to point at
  your actual latest forum migration.
- This changes the uniqueness rule on Tag from unique(name) to
  unique(parent, name) — real schema change, not purely additive.

What this does, in order:
1. Adds `slug`, `level`, `parent` columns to forum_tag (level defaults to
   "tag" for existing rows, which is what they conceptually were).
2. Backfills: creates a single "General" Category -> "General" Subcategory
   bucket and reparents every pre-existing tag under it, so nothing is
   orphaned and the app-level invariant (every TAG has a SUBCATEGORY
   parent) holds immediately after this migration runs.
   This is a placeholder bucket — you'll want to manually re-sort real
   tags into proper categories/subcategories afterwards (via Django admin
   or a follow-up script). The app will work correctly in the meantime,
   just with a flat "General" taxonomy.
3. Drops the old unique(name) constraint and adds unique(parent, name).
"""
import uuid

import django.db.models.deletion
from django.db import migrations, models


def seed_default_bucket_and_backfill(apps, schema_editor):
    Tag = apps.get_model("forum", "Tag")

    existing_tags = list(Tag.objects.filter(parent__isnull=True))
    if not existing_tags:
        return

    general_category = Tag.objects.create(
        id=uuid.uuid4(),
        name="General",
        slug="general",
        level="category",
        parent=None,
    )
    general_subcategory = Tag.objects.create(
        id=uuid.uuid4(),
        name="General",
        slug="general-subcategory",
        level="subcategory",
        parent=general_category,
    )

    for tag in existing_tags:
        tag.level = "tag"
        tag.parent = general_subcategory
        if not tag.slug:
            tag.slug = tag.name.lower().replace(" ", "-")[:100]
        tag.save(update_fields=["level", "parent", "slug"])


def reverse_backfill(apps, schema_editor):
    # Best-effort reverse: unhook the backfilled tags and drop the bucket.
    Tag = apps.get_model("forum", "Tag")
    Tag.objects.filter(slug__in=["general", "general-subcategory"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("forum", "0002_rename_forum_ans_q_created_idx_forum_answe_questio_60e4de_idx_and_more"),  # <-- adjust to your actual latest migration
    ]

    operations = [
        migrations.AddField(
            model_name="tag",
            name="slug",
            field=models.SlugField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="tag",
            name="level",
            field=models.CharField(
                choices=[
                    ("category", "Category"),
                    ("subcategory", "Subcategory"),
                    ("tag", "Tag"),
                ],
                default="tag",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="tag",
            name="parent",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="children",
                to="forum.tag",
            ),
        ),
        migrations.AlterField(
            model_name="tag",
            name="name",
            field=models.CharField(max_length=80),  # drops unique=True — must happen before the backfill below inserts two "General" rows
        ),
        migrations.RunPython(seed_default_bucket_and_backfill, reverse_backfill),
        migrations.AlterModelOptions(
            name="tag",
            options={"ordering": ["level", "name"]},
        ),
        migrations.AddConstraint(
            model_name="tag",
            constraint=models.UniqueConstraint(
                fields=("parent", "name"), name="unique_tag_name_per_parent"
            ),
        ),
        migrations.AddIndex(
            model_name="tag",
            index=models.Index(fields=["parent", "level"], name="forum_tag_parent_level_idx"),
        ),
        migrations.AddIndex(
            model_name="tag",
            index=models.Index(fields=["slug"], name="forum_tag_slug_idx"),
        ),
    ]