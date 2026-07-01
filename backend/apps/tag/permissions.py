from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    """Any authenticated user can read the taxonomy.

    Only staff can create, update, or delete categories, subcategories,
    or leaf tags — the taxonomy is curated, not user-generated.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_staff)