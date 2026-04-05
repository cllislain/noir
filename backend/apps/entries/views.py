import uuid
from datetime import timedelta, timezone as dt_timezone

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.tags.models import Tag
from .models import Entry, Attachment, EntryVersion
from .serializers import (
    EntryListSerializer,
    EntryDetailSerializer,
    EntryWriteSerializer,
    EntryTrashSerializer,
    EntryVersionSerializer,
    EntryShareSerializer,
    AttachmentSerializer,
    AttachmentUploadSerializer,
)
from .filters import EntryFilter


class EntryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EntryFilter
    search_fields = ["title", "body"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        # Trash action gets only deleted entries; all others get only live entries
        if getattr(self, "action", None) == "trash":
            return (
                Entry.objects.filter(author=self.request.user, is_deleted=True)
                .prefetch_related("tags")
                .distinct()
            )
        return (
            Entry.objects.filter(author=self.request.user, is_deleted=False)
            .prefetch_related("tags")
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "trash":
            return EntryTrashSerializer
        if self.action == "list":
            return EntryListSerializer
        if self.action in ("create", "update", "partial_update"):
            return EntryWriteSerializer
        return EntryDetailSerializer

    def perform_create(self, serializer) -> None:
        serializer.save(author=self.request.user)

    def perform_destroy(self, instance: Entry) -> None:
        """Soft-delete instead of permanently deleting."""
        instance.soft_delete()

    # ── Trash endpoints ────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="trash")
    def trash(self, request: Request) -> Response:
        """List all soft-deleted entries for the authenticated user."""
        queryset = self.get_queryset()
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="restore")
    def restore(self, request: Request, pk: str | None = None) -> Response:
        """Restore a soft-deleted entry back to the active list."""
        entry = Entry.objects.filter(
            pk=pk, author=request.user, is_deleted=True
        ).first()
        if entry is None:
            return Response(
                {"detail": "Not found in trash."},
                status=status.HTTP_404_NOT_FOUND,
            )
        entry.restore()
        return Response(EntryDetailSerializer(entry).data)

    @action(detail=True, methods=["delete"], url_path="hard-delete")
    def hard_delete(self, request: Request, pk: str | None = None) -> Response:
        """Permanently and irreversibly delete an entry from trash."""
        entry = Entry.objects.filter(
            pk=pk, author=request.user, is_deleted=True
        ).first()
        if entry is None:
            return Response(
                {"detail": "Not found in trash."},
                status=status.HTTP_404_NOT_FOUND,
            )
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Insights endpoints ─────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="insights/heatmap")
    def heatmap(self, request: Request) -> Response:
        """Return entry counts per day for a given month (defaults to current)."""
        now = timezone.now()
        try:
            year = int(request.query_params.get("year", now.year))
            month = int(request.query_params.get("month", now.month))
        except (ValueError, TypeError):
            year, month = now.year, now.month

        from datetime import date as date_type
        import calendar

        # Start and end of the requested month
        _, days_in_month = calendar.monthrange(year, month)
        start = timezone.datetime(year, month, 1, tzinfo=dt_timezone.utc)
        end = timezone.datetime(year, month, days_in_month, 23, 59, 59, tzinfo=dt_timezone.utc)

        rows = (
            Entry.objects.filter(
                author=request.user,
                is_deleted=False,
                created_at__gte=start,
                created_at__lte=end,
            )
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
        )

        data = {row["date"].isoformat(): row["count"] for row in rows}
        return Response({"year": year, "month": month, "days": data})

    @action(detail=False, methods=["get"], url_path="insights/streak")
    def streak(self, request: Request) -> Response:
        """Return current streak, longest streak, and today's entry count."""
        from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

        tz_name = request.query_params.get("tz", "UTC")
        try:
            tz = ZoneInfo(tz_name)
        except (ZoneInfoNotFoundError, Exception):
            tz = ZoneInfo("UTC")

        today = timezone.now().astimezone(tz).date()

        today_count = Entry.objects.filter(
            author=request.user,
            is_deleted=False,
            created_at__date=today,
        ).count()

        # All distinct entry dates for this user, sorted newest-first
        dates = sorted(
            Entry.objects.filter(author=request.user, is_deleted=False)
            .annotate(d=TruncDate("created_at"))
            .values_list("d", flat=True)
            .distinct(),
            reverse=True,
        )

        if not dates:
            return Response({"current_streak": 0, "longest_streak": 0, "today_count": 0})

        date_set = set(dates)

        # Current streak: walk back from today (or yesterday if today has no entry)
        current_streak = 0
        check = today if today in date_set else today - timedelta(days=1)
        while check in date_set:
            current_streak += 1
            check -= timedelta(days=1)

        # Longest streak: find the longest consecutive-day run in all dates
        longest = 1
        run = 1
        for i in range(1, len(dates)):
            if (dates[i - 1] - dates[i]).days == 1:
                run += 1
                if run > longest:
                    longest = run
            else:
                run = 1

        return Response(
            {
                "current_streak": current_streak,
                "longest_streak": longest,
                "today_count": today_count,
            }
        )

    @action(detail=False, methods=["get"], url_path="insights/mood-trend")
    def mood_trend(self, request: Request) -> Response:
        """Return daily mood counts for the last N days (default 90)."""
        days = min(int(request.query_params.get("days", 90)), 365)
        since = timezone.now() - timedelta(days=days)

        rows = (
            Entry.objects.filter(
                author=request.user,
                is_deleted=False,
                created_at__gte=since,
                mood__in=["happy", "neutral", "sad", "anxious", "grateful"],
            )
            .annotate(date=TruncDate("created_at"))
            .values("date", "mood")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        trend: dict[str, dict] = {}
        for row in rows:
            date_str: str = row["date"].isoformat()
            if date_str not in trend:
                trend[date_str] = {
                    "date": date_str,
                    "happy": 0,
                    "neutral": 0,
                    "sad": 0,
                    "anxious": 0,
                    "grateful": 0,
                }
            trend[date_str][row["mood"]] = row["count"]

        return Response(sorted(trend.values(), key=lambda x: x["date"]))

    @action(detail=False, methods=["get"], url_path="insights/monthly-recap")
    def monthly_recap(self, request: Request) -> Response:
        """Return entry stats for the current calendar month."""
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        entries = Entry.objects.filter(
            author=request.user,
            is_deleted=False,
            created_at__gte=month_start,
        )

        mood_distribution = {
            mood: entries.filter(mood=mood).count()
            for mood in ["happy", "neutral", "sad", "anxious", "grateful"]
        }

        top_tags = list(
            Tag.objects.filter(owner=request.user, entries__in=entries)
            .annotate(count=Count("entries"))
            .order_by("-count")[:5]
            .values("id", "name", "color", "count")
        )
        # UUID fields come back as UUID objects — serialise to str
        for t in top_tags:
            t["id"] = str(t["id"])

        return Response(
            {
                "month": now.strftime("%Y-%m"),
                "total_entries": entries.count(),
                "mood_distribution": mood_distribution,
                "top_tags": top_tags,
            }
        )

    @action(detail=False, methods=["get"], url_path="insights/on-this-day")
    def on_this_day(self, request: Request) -> Response:
        """Return entries written on the same month/day in previous years."""
        now = timezone.now()

        entries = (
            Entry.objects.filter(
                author=request.user,
                is_deleted=False,
                created_at__month=now.month,
                created_at__day=now.day,
            )
            .exclude(created_at__year=now.year)
            .prefetch_related("tags")
            .order_by("-created_at")
        )

        data = [
            {
                "id": str(entry.id),
                "title": entry.title,
                "mood": entry.mood,
                "created_at": entry.created_at.isoformat(),
                "years_ago": now.year - entry.created_at.year,
            }
            for entry in entries
        ]

        return Response(data)

    # ── Versioning ─────────────────────────────────────────────────────────

    @action(detail=True, methods=["get"], url_path="versions")
    def versions(self, request: Request, pk: str | None = None) -> Response:
        """List saved versions (snapshots) for an entry, newest first."""
        entry = Entry.objects.filter(pk=pk, author=request.user, is_deleted=False).first()
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        qs = EntryVersion.objects.filter(entry=entry)[:50]
        return Response(EntryVersionSerializer(qs, many=True).data)

    # ── Sharing ────────────────────────────────────────────────────────────

    @action(detail=True, methods=["post"], url_path="share")
    def share(self, request: Request, pk: str | None = None) -> Response:
        """Generate (or return existing) share token for an entry."""
        entry = Entry.objects.filter(pk=pk, author=request.user, is_deleted=False).first()
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if not entry.share_token:
            entry.share_token = uuid.uuid4()
            entry.save(update_fields=["share_token"])
        return Response({"share_token": str(entry.share_token)})

    @action(detail=True, methods=["post"], url_path="unshare")
    def unshare(self, request: Request, pk: str | None = None) -> Response:
        """Revoke the share token for an entry."""
        entry = Entry.objects.filter(pk=pk, author=request.user, is_deleted=False).first()
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        entry.share_token = None
        entry.save(update_fields=["share_token"])
        return Response({"share_token": None})


class SharedEntryView(APIView):
    """Public read-only view for a shared entry. No authentication required."""
    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, token: str) -> Response:
        try:
            token_uuid = uuid.UUID(str(token))
        except ValueError:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        entry = (
            Entry.objects.filter(share_token=token_uuid, is_deleted=False)
            .prefetch_related("tags")
            .first()
        )
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(EntryShareSerializer(entry).data)


class AttachmentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _get_entry(self, request: Request, entry_pk: str) -> Entry | None:
        return Entry.objects.filter(
            pk=entry_pk, author=request.user, is_deleted=False
        ).first()

    def list(self, request: Request, entry_pk: str | None = None) -> Response:
        entry = self._get_entry(request, entry_pk)
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttachmentSerializer(
            entry.attachments.all(), many=True, context={"request": request}
        )
        return Response(serializer.data)

    def create(self, request: Request, entry_pk: str | None = None) -> Response:
        entry = self._get_entry(request, entry_pk)
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if entry.attachments.count() >= 10:
            return Response(
                {"detail": "Maximum of 10 attachments per entry."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        upload_serializer = AttachmentUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        file = upload_serializer.validated_data["file"]

        attachment = Attachment.objects.create(
            entry=entry,
            file=file,
            original_filename=file.name,
            file_size=file.size,
            content_type=file.content_type,
        )
        return Response(
            AttachmentSerializer(attachment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request: Request, entry_pk: str | None = None, pk: str | None = None) -> Response:
        entry = self._get_entry(request, entry_pk)
        if entry is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        attachment = Attachment.objects.filter(pk=pk, entry=entry).first()
        if attachment is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        attachment.file.delete(save=False)
        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
