import django_filters
from .models import Entry


class EntryFilter(django_filters.FilterSet):
    tags = django_filters.BaseInFilter(field_name="tags__id", lookup_expr="in")
    mood = django_filters.CharFilter(field_name="mood", lookup_expr="exact")
    is_favorite = django_filters.BooleanFilter(field_name="is_favorite")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Entry
        fields = ["tags", "mood", "is_favorite", "created_after", "created_before"]
