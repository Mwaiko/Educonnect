from django.contrib import admin
from django.urls import path, include
from apps.users.urls import auth_urlpatterns, user_urlpatterns

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include((auth_urlpatterns, "auth"))),
    path("api/v1/users/", include((user_urlpatterns, "users"))),
]
