from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    """Anyone — authenticated or not — can read the taxonomy.

    Tag reads need to be public: e.g. the registration page calls
    GET /api/v1/tags/?level=subcategory to populate the subject picker
    before the user has an account or a JWT.

    Only staff can create, update, or delete categories, subcategories,
    or leaf tags — the taxonomy is curated, not user-generated.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)