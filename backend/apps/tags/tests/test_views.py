import pytest
from django.urls import reverse
from rest_framework import status
from apps.tags.models import Tag


@pytest.fixture
def tag(auth_api_client):
    _, user = auth_api_client
    return Tag.objects.create(owner=user, name="Work", color="#3B82F6")


class TestTagList:
    def test_list_own_tags(self, auth_api_client, tag):
        client, _ = auth_api_client
        response = client.get(reverse("tag-list"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["name"] == "Work"

    def test_cannot_see_other_user_tags(self, auth_api_client, make_user):
        client, _ = auth_api_client
        other = make_user(email="other@example.com", username="other")
        Tag.objects.create(owner=other, name="Personal")
        response = client.get(reverse("tag-list"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_unauthenticated_blocked(self, api_client):
        response = api_client.get(reverse("tag-list"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestTagCreate:
    def test_create_tag(self, auth_api_client):
        client, _ = auth_api_client
        response = client.post(
            reverse("tag-list"),
            {"name": "Personal", "color": "#10B981"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Personal"

    def test_duplicate_tag_name_blocked(self, auth_api_client, tag):
        client, _ = auth_api_client
        response = client.post(
            reverse("tag-list"),
            {"name": "Work", "color": "#000000"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestTagUpdate:
    def test_patch_tag(self, auth_api_client, tag):
        client, _ = auth_api_client
        response = client.patch(
            reverse("tag-detail", args=[tag.id]),
            {"color": "#EF4444"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["color"] == "#EF4444"

    def test_cannot_patch_other_user_tag(self, auth_api_client, make_user):
        client, _ = auth_api_client
        other = make_user(email="other@example.com", username="other")
        other_tag = Tag.objects.create(owner=other, name="Other")
        response = client.patch(
            reverse("tag-detail", args=[other_tag.id]),
            {"name": "Hijacked"},
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestTagDelete:
    def test_delete_tag(self, auth_api_client, tag):
        client, _ = auth_api_client
        response = client.delete(reverse("tag-detail", args=[tag.id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Tag.objects.filter(id=tag.id).exists()
