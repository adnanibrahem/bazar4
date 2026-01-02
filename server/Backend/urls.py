
from django.contrib import admin
from django.urls import path, include

# //////////////////////////////////////////////////////////////////
from django.conf.urls.static import static
# These two models for editing media files url and chanage CP header
from django.conf import settings

from rest_framework_jwt.views import obtain_jwt_token, verify_jwt_token


urlpatterns = [

    path('sys/', admin.site.urls),
    path('api/auth/token/', obtain_jwt_token),
    path('api/auth/verify/', verify_jwt_token),

    path('api/users/', include('Apps.Users.api.urls', namespace='users')),
    path('api/agents/', include('Apps.Agents.api.urls', namespace='agents')),
    path('api/box/', include('Apps.Box.api.urls', namespace='box')),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.AdminSite.site_title = 'بازار فور'
admin.AdminSite.site_header = 'بازار فور'
