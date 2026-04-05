from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EntryViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r"", EntryViewSet, basename="entry")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "<str:entry_pk>/attachments/",
        AttachmentViewSet.as_view({"get": "list", "post": "create"}),
        name="entry-attachments-list",
    ),
    path(
        "<str:entry_pk>/attachments/<str:pk>/",
        AttachmentViewSet.as_view({"delete": "destroy"}),
        name="entry-attachments-detail",
    ),
]
