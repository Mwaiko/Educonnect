from rest_framework import permissions


class IsAuthorOrAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to anyone authenticated; write access only to the
    object's author or an admin."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and (
            obj.author_id == user.id or user.role == "admin"
        )


class IsExpertSolverOrAdmin(permissions.BasePermission):
    """Only Expert Solvers or Admins may endorse answers."""

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role in ("expert_solver", "admin")


class IsQuestionAuthor(permissions.BasePermission):
    """Only the question's original author may accept an answer."""

    def has_permission(self, request, view):
        return request.user.is_authenticated
