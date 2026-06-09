from rest_framework.permissions import BasePermission, IsAuthenticated


class IsStudent(BasePermission):
    """Allows access only to users with role='student'."""
    message = "Only students can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "student"
        )


class IsExpertSolver(BasePermission):
    """Allows access only to users with role='expert_solver'."""
    message = "Only expert solvers can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "expert_solver"
        )


class IsStudentOrExpert(BasePermission):
    """Allows access to any authenticated user (student or expert_solver)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: only the owner of a resource may write to it.
    Assumes the model instance has a `user` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions (GET, HEAD, OPTIONS) are open to any authenticated user
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        # Write access requires ownership
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user
