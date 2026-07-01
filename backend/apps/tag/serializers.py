from rest_framework import serializers

from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Read shape — used for list/retrieve, and nested on questions elsewhere."""

    breadcrumb = serializers.ReadOnlyField()

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "level", "parent", "breadcrumb"]
        read_only_fields = ["id", "slug", "breadcrumb"]


class TagWriteSerializer(serializers.ModelSerializer):
    """Create/update shape.

    Tag.clean() (called from Tag.save()) already enforces the
    category->subcategory->tag parent rules, but letting that raise
    straight out of .save() would surface as an unhandled ValidationError
    (500) rather than a normal DRF 400. This re-checks the same rule here
    so a bad `level`/`parent` combination comes back as a field error.
    """

    class Meta:
        model = Tag
        fields = ["id", "name", "level", "parent"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        level = attrs.get("level", getattr(self.instance, "level", Tag.Level.TAG))
        parent = attrs.get("parent", getattr(self.instance, "parent", None))
        expected_parent_level = Tag.PARENT_LEVEL[level]

        if expected_parent_level is None and parent is not None:
            raise serializers.ValidationError(
                {"parent": "Categories cannot have a parent."}
            )
        if expected_parent_level is not None:
            if parent is None:
                raise serializers.ValidationError(
                    {"parent": f"A {level} requires a parent {expected_parent_level}."}
                )
            if parent.level != expected_parent_level:
                raise serializers.ValidationError(
                    {
                        "parent": (
                            f"A {level} must have a {expected_parent_level} "
                            f"parent, got {parent.level}."
                        )
                    }
                )
        return attrs

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        return value