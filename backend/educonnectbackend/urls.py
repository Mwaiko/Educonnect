from django.contrib import admin
from django.urls import path, include
from apps.users.urls import auth_urlpatterns, user_urlpatterns,dashboard_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/resources/', include('resources.urls')),
    path('api/v1/gamification/', include('apps.gamification.urls')),
    path('api/v1/groups/', include('groups.urls')),
    path('api/v1/forum/', include('apps.forum.urls')),
    path('api/v1/auth/', include((auth_urlpatterns, 'auth'))),
    path('api/v1/users/', include((user_urlpatterns, 'users'))),
    path('api/v1/chat/', include('chat.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/dashboard/', include((dashboard_urlpatterns, 'dashboard'))),
    path("api/v1/tags/", include("apps.tag.urls")),
]