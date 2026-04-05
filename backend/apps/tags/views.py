from django.db.models import Count
from rest_framework import viewsets, permissions
from .models import Tag
from .serializers import TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Tag.objects.filter(owner=self.request.user).annotate(
            entry_count=Count("entries")
        ).order_by("name")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
