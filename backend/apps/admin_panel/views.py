from django.db.models import Count
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.entries.models import Entry
from apps.entries.serializers import EntryDetailSerializer
from apps.tags.models import Tag

from .models import SiteSettings
from .serializers import (
    AdminStatsSerializer,
    AdminUserSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    AdminSetPasswordSerializer,
    AdminEntrySerializer,
    AdminEntryWriteSerializer,
    AdminTagSerializer,
    AdminTagWriteSerializer,
    SiteSettingsSerializer,
    SharedLinkSerializer,
)


class IsStaffUser(permissions.BasePermission):
    """Allow access only to staff (is_staff=True) users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


# ── Stats ──────────────────────────────────────────────────────────────────

class AdminStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request: Request) -> Response:
        data = {
            "total_users":    User.objects.count(),
            "active_users":   User.objects.filter(is_active=True).count(),
            "staff_users":    User.objects.filter(is_staff=True).count(),
            "total_entries":  Entry.objects.count(),
            "active_entries": Entry.objects.filter(is_deleted=False).count(),
            "deleted_entries":Entry.objects.filter(is_deleted=True).count(),
            "total_tags":     Tag.objects.count(),
        }
        return Response(AdminStatsSerializer(data).data)


# ── Users ──────────────────────────────────────────────────────────────────

class AdminUserViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStaffUser]
    serializer_class = AdminUserSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["email", "username"]
    ordering_fields = ["email", "date_joined", "last_login"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        return (
            User.objects.annotate(entry_count=Count("entries"))
            .order_by("-date_joined")
        )

    def list(self, request: Request) -> Response:
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)

    def retrieve(self, request: Request, pk=None) -> Response:
        user = self.get_object()
        return Response(self.get_serializer(user).data)

    def partial_update(self, request: Request, pk=None) -> Response:
        """Toggle is_active or is_staff. Superusers are protected."""
        user = self.get_object()
        if user.is_superuser:
            return Response(
                {"detail": "Superuser accounts cannot be modified here."},
                status=status.HTTP_403_FORBIDDEN,
            )
        allowed = {k: v for k, v in request.data.items() if k in ("is_active", "is_staff")}
        for field, value in allowed.items():
            setattr(user, field, value)
        user.save(update_fields=list(allowed.keys()))
        return Response(self.get_serializer(user).data)

    def destroy(self, request: Request, pk=None) -> Response:
        """Hard-delete a non-superuser account and all its data."""
        user = self.get_object()
        if user.is_superuser:
            return Response(
                {"detail": "Superuser accounts cannot be deleted here."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_403_FORBIDDEN,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request: Request) -> Response:
        ser = AdminUserCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(
            AdminUserSerializer(User.objects.annotate(entry_count=Count("entries")).get(pk=user.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request: Request, pk=None) -> Response:
        user = self.get_object()
        if user.is_superuser:
            return Response(
                {"detail": "Superuser accounts cannot be edited here."},
                status=status.HTTP_403_FORBIDDEN,
            )
        ser = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(
            AdminUserSerializer(User.objects.annotate(entry_count=Count("entries")).get(pk=user.pk)).data
        )

    @action(detail=True, methods=["post"], url_path="set-password")
    def set_password(self, request: Request, pk=None) -> Response:
        user = self.get_object()
        if user.is_superuser and user != request.user:
            return Response(
                {"detail": "Cannot change another superuser's password."},
                status=status.HTTP_403_FORBIDDEN,
            )
        ser = AdminSetPasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user.set_password(ser.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated."})


# ── Entries ────────────────────────────────────────────────────────────────

class AdminEntryViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStaffUser]
    serializer_class = AdminEntrySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "body", "author__email"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Entry.objects.annotate(tag_count=Count("tags")).select_related("author")
        view_filter = self.request.query_params.get("view", "all")
        if view_filter == "active":
            qs = qs.filter(is_deleted=False)
        elif view_filter == "deleted":
            qs = qs.filter(is_deleted=True)
        return qs

    def list(self, request: Request) -> Response:
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)

    def retrieve(self, request: Request, pk=None) -> Response:
        entry = self.get_object()
        return Response(EntryDetailSerializer(entry).data)

    def destroy(self, request: Request, pk=None) -> Response:
        """Soft-delete an active entry."""
        entry = self.get_object()
        if entry.is_deleted:
            return Response(
                {"detail": "Entry is already in trash."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request: Request, pk=None) -> Response:
        entry = self.get_object()
        if not entry.is_deleted:
            return Response(
                {"detail": "Entry is not in trash."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.restore()
        return Response(EntryDetailSerializer(entry).data)

    @action(detail=True, methods=["delete"], url_path="hard-delete")
    def hard_delete(self, request: Request, pk=None) -> Response:
        entry = self.get_object()
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request: Request) -> Response:
        ser = AdminEntryWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        entry = ser.save()
        return Response(
            AdminEntrySerializer(Entry.objects.annotate(tag_count=Count("tags")).get(pk=entry.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request: Request, pk=None) -> Response:
        entry = self.get_object()
        ser = AdminEntryWriteSerializer(entry, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(
            AdminEntrySerializer(Entry.objects.annotate(tag_count=Count("tags")).get(pk=entry.pk)).data
        )


# ── Tags ───────────────────────────────────────────────────────────────────

class AdminTagViewSet(viewsets.GenericViewSet):
    permission_classes = [IsStaffUser]
    serializer_class = AdminTagSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "owner__email"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        return (
            Tag.objects.annotate(entry_count=Count("entries"))
            .select_related("owner")
        )

    def list(self, request: Request) -> Response:
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)

    def retrieve(self, request: Request, pk=None) -> Response:
        return Response(self.get_serializer(self.get_object()).data)

    def destroy(self, request: Request, pk=None) -> Response:
        self.get_object().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request: Request) -> Response:
        ser = AdminTagWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tag = ser.save()
        return Response(
            AdminTagSerializer(Tag.objects.annotate(entry_count=Count("entries")).get(pk=tag.pk)).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request: Request, pk=None) -> Response:
        tag = self.get_object()
        ser = AdminTagWriteSerializer(tag, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(
            AdminTagSerializer(Tag.objects.annotate(entry_count=Count("entries")).get(pk=tag.pk)).data
        )


# ── Site Settings ──────────────────────────────────────────────────────────

class AdminSettingsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request: Request) -> Response:
        from django.conf import settings as dj_settings
        site = SiteSettings.get()
        data = SiteSettingsSerializer(site).data
        # Append read-only runtime config for display
        data["auth_throttle_rate"] = dj_settings.REST_FRAMEWORK.get(
            "DEFAULT_THROTTLE_RATES", {}
        ).get("auth", "10/hour")
        return Response(data)

    def patch(self, request: Request) -> Response:
        site = SiteSettings.get()
        ser = SiteSettingsSerializer(site, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(SiteSettingsSerializer(site).data)


# ── Shared Links ───────────────────────────────────────────────────────────

class AdminSharedLinksView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request: Request) -> Response:
        qs = (
            Entry.objects.filter(share_token__isnull=False, is_deleted=False)
            .select_related("author")
            .order_by("-created_at")
        )
        page_size = 20
        try:
            page = int(request.query_params.get("page", 1))
        except (ValueError, TypeError):
            page = 1
        start = (page - 1) * page_size
        end = start + page_size
        total = qs.count()
        serializer = SharedLinkSerializer(qs[start:end], many=True)
        return Response({"count": total, "results": serializer.data})


class AdminRevokeSharedLinkView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request: Request, pk: str) -> Response:
        entry = Entry.objects.filter(pk=pk, is_deleted=False).first()
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        entry.share_token = None
        entry.save(update_fields=["share_token"])
        return Response({"detail": "Share link revoked."})
