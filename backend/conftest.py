import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def make_user(db):
    def _make(email="user@example.com", username="user", password="StrongPass123!"):
        return User.objects.create_user(email=email, username=username, password=password)
    return _make


@pytest.fixture
def auth_api_client(api_client, make_user):
    user = make_user()
    api_client.force_authenticate(user=user)
    return api_client, user
