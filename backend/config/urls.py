from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse
from apps.entries.views import SharedEntryView


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "auth":    request.build_absolute_uri("/api/v1/auth/"),
        "entries": reverse("entry-list", request=request),
        "tags":    reverse("tag-list", request=request),
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", api_root),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/entries/", include("apps.entries.urls")),
    path("api/v1/tags/", include("apps.tags.urls")),
    path("api/v1/admin/", include("apps.admin_panel.urls")),
    path("api/v1/share/<str:token>/", SharedEntryView.as_view(), name="shared-entry"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
