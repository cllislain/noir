from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminStatsView,
    AdminUserViewSet,
    AdminEntryViewSet,
    AdminTagViewSet,
    AdminSettingsView,
    AdminSharedLinksView,
    AdminRevokeSharedLinkView,
)

router = DefaultRouter()
router.register(r"users", AdminUserViewSet, basename="admin-user")
router.register(r"entries", AdminEntryViewSet, basename="admin-entry")
router.register(r"tags", AdminTagViewSet, basename="admin-tag")

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("settings/", AdminSettingsView.as_view(), name="admin-settings"),
    path("shared-links/", AdminSharedLinksView.as_view(), name="admin-shared-links"),
    path("shared-links/<str:pk>/revoke/", AdminRevokeSharedLinkView.as_view(), name="admin-revoke-link"),
    path("", include(router.urls)),
]
