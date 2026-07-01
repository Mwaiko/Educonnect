import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


class TagQuerySet(models.QuerySet):
    def categories(self):
        return self.filter(level=Tag.Level.CATEGORY)

    def subcategories(self):
        return self.filter(level=Tag.Level.SUBCATEGORY)

    def leaf_tags(self):
        return self.filter(level=Tag.Level.TAG)


class Tag(models.Model):
    """tags_tag — hierarchical taxonomy: Category -> Subcategory -> Tag.

    e.g. Science, Technology, Engineering, Mathematics (category)
         -> Calculus, Algebra, Physics... (subcategory)
         -> "Chain Rule", "Limits"... (tag, actually attached to questions)

    Standalone app so other modules (forum today, potentially resources /
    groups later) can depend on a single shared taxonomy instead of each
    rolling its own free-text tag field.
    """

    class Level(models.TextChoices):
        CATEGORY = "category", "Category"
        SUBCATEGORY = "subcategory", "Subcategory"
        TAG = "tag", "Tag"

    # What level of parent each level requires. None = must have no parent.
    PARENT_LEVEL = {
        Level.CATEGORY: None,
        Level.SUBCATEGORY: Level.CATEGORY,
        Level.TAG: Level.SUBCATEGORY,
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=100, blank=True)
    level = models.CharField(
        max_length=20, choices=Level.choices, default=Level.TAG
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )

    objects = TagQuerySet.as_manager()

    class Meta:
        db_table = "tags_tag"
        ordering = ["level", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "name"], name="unique_tag_name_per_parent"
            ),
        ]
        indexes = [
            models.Index(fields=["parent", "level"], name="forum_tag_parent_level_idx"),
            models.Index(fields=["slug"], name="forum_tag_slug_idx"),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        expected_parent_level = self.PARENT_LEVEL[self.level]

        if expected_parent_level is None and self.parent is not None:
            raise ValidationError("Categories cannot have a parent.")
        if expected_parent_level is not None:
            if self.parent is None:
                raise ValidationError(
                    f"{self.get_level_display()} requires a parent {expected_parent_level}."
                )
            if self.parent.level != expected_parent_level:
                raise ValidationError(
                    f"{self.get_level_display()} must have a "
                    f"{expected_parent_level} parent, got {self.parent.level}."
                )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:100]
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def breadcrumb(self):
        """e.g. 'Mathematics > Calculus > Chain Rule'."""
        parts = [self.name]
        node = self.parent
        while node is not None:
            parts.append(node.name)
            node = node.parent
        return " > ".join(reversed(parts))