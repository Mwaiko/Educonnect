from rest_framework import generics, status
from rest_framework.response import Response

from .models import Tag
from .permissions import IsStaffOrReadOnly
from .serializers import TagSerializer, TagWriteSerializer


class TagListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/tags/                    -> top-level categories
    GET  /api/v1/tags/?level=category      -> all categories
    GET  /api/v1/tags/?level=subcategory   -> all subcategories
    GET  /api/v1/tags/?level=tag           -> all leaf tags
    GET  /api/v1/tags/?parent=<uuid>       -> children of a given tag
    POST /api/v1/tags/                     -> create a tag (staff only)

    No params returns top-level categories, so a frontend picker can walk
    the tree by calling this repeatedly with `?parent=<id>` of whatever
    the user just selected.
    """

    permission_classes = [IsStaffOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TagWriteSerializer
        return TagSerializer

    def get_queryset(self):
        qs = Tag.objects.select_related("parent")
        parent = self.request.query_params.get("parent")
        level = self.request.query_params.get("level")

        if parent:
            qs = qs.filter(parent_id=parent)
        elif level:
            qs = qs.filter(level=level)
        else:
            qs = qs.filter(level=Tag.Level.CATEGORY)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag = serializer.save()
        out = TagSerializer(tag)
        headers = self.get_success_headers(out.data)
        return Response(out.data, status=status.HTTP_201_CREATED, headers=headers)


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/tags/<uuid:pk>/  -> retrieve a single tag
    PATCH  /api/v1/tags/<uuid:pk>/  -> update (staff only)
    DELETE /api/v1/tags/<uuid:pk>/  -> delete (staff only)

    Note: deleting a category or subcategory CASCADEs to everything below
    it (children, and QuestionTag rows for any leaf tags in that branch),
    which silently untags whatever questions used those tags. Worth a
    confirmation step in the admin UI before wiring delete up to a button.
    """

    queryset = Tag.objects.select_related("parent")
    permission_classes = [IsStaffOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return TagWriteSerializer
        return TagSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        tag = serializer.save()
        return Response(TagSerializer(tag).data)