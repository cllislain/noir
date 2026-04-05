import pytest
from django.urls import reverse
from rest_framework import status
from apps.entries.models import Entry
from apps.tags.models import Tag


@pytest.fixture
def tag(auth_api_client):
    _, user = auth_api_client
    return Tag.objects.create(owner=user, name="Work", color="#3B82F6")


@pytest.fixture
def entry(auth_api_client):
    _, user = auth_api_client
    return Entry.objects.create(
        author=user,
        title="My First Entry",
        body="This is the **body** of my journal entry.",
        mood="happy",
    )


class TestEntryList:
    def test_list_own_entries(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.get(reverse("entry-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["title"] == "My First Entry"

    def test_cannot_see_other_user_entries(self, auth_api_client, make_user):
        client, _ = auth_api_client
        other = make_user(email="other@example.com", username="other")
        Entry.objects.create(author=other, title="Other Entry", body="Secret")
        response = client.get(reverse("entry-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0

    def test_unauthenticated_blocked(self, api_client):
        response = api_client.get(reverse("entry-list"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_body_preview_truncated(self, auth_api_client):
        _, user = auth_api_client
        client, _ = auth_api_client
        long_body = "x" * 500
        Entry.objects.create(author=user, title="Long", body=long_body)
        response = client.get(reverse("entry-list"))
        assert len(response.data["results"][0]["body_preview"]) <= 200


class TestEntrySearch:
    def test_search_by_title(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.get(reverse("entry-list"), {"search": "First"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_search_no_match(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.get(reverse("entry-list"), {"search": "zzznomatch"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0

    def test_filter_by_mood(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.get(reverse("entry-list"), {"mood": "happy"})
        assert response.data["count"] == 1
        response2 = client.get(reverse("entry-list"), {"mood": "sad"})
        assert response2.data["count"] == 0

    def test_filter_by_favorite(self, auth_api_client, entry):
        client, _ = auth_api_client
        entry.is_favorite = True
        entry.save()
        response = client.get(reverse("entry-list"), {"is_favorite": "true"})
        assert response.data["count"] == 1

    def test_filter_by_tag(self, auth_api_client, entry, tag):
        client, _ = auth_api_client
        entry.tags.add(tag)
        response = client.get(reverse("entry-list"), {"tags": str(tag.id)})
        assert response.data["count"] == 1


class TestEntryCreate:
    def test_create_entry(self, auth_api_client):
        client, _ = auth_api_client
        response = client.post(
            reverse("entry-list"),
            {"title": "New Entry", "body": "Some content here.", "mood": "neutral"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "New Entry"

    def test_create_entry_with_tags(self, auth_api_client, tag):
        client, _ = auth_api_client
        response = client.post(
            reverse("entry-list"),
            {"title": "Tagged", "body": "Content", "tag_ids": [str(tag.id)]},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert len(response.data["tags"]) == 1

    def test_create_entry_with_other_user_tag_blocked(self, auth_api_client, make_user):
        client, _ = auth_api_client
        other = make_user(email="other@example.com", username="other")
        other_tag = Tag.objects.create(owner=other, name="OtherTag")
        response = client.post(
            reverse("entry-list"),
            {"title": "Bad", "body": "Body", "tag_ids": [str(other_tag.id)]},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestEntryRetrieve:
    def test_retrieve_own_entry(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.get(reverse("entry-detail", args=[entry.id]))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["body"] == entry.body

    def test_retrieve_other_user_entry_blocked(self, auth_api_client, make_user):
        client, _ = auth_api_client
        other = make_user(email="other@example.com", username="other")
        other_entry = Entry.objects.create(author=other, title="Secret", body="Hidden")
        response = client.get(reverse("entry-detail", args=[other_entry.id]))
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestEntryUpdate:
    def test_patch_entry(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.patch(
            reverse("entry-detail", args=[entry.id]),
            {"title": "Updated Title"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Updated Title"

    def test_patch_is_favorite(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.patch(
            reverse("entry-detail", args=[entry.id]),
            {"is_favorite": True},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK


class TestEntryDelete:
    def test_delete_own_entry(self, auth_api_client, entry):
        client, _ = auth_api_client
        response = client.delete(reverse("entry-detail", args=[entry.id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Entry.objects.filter(id=entry.id).exists()

    def test_delete_other_user_entry_blocked(self, auth_api_client, make_user):
        client, _ = auth_api_client
        other = make_user(email="other@example.com", username="other")
        other_entry = Entry.objects.create(author=other, title="Secret", body="Hidden")
        response = client.delete(reverse("entry-detail", args=[other_entry.id]))
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Entry.objects.filter(id=other_entry.id).exists()
