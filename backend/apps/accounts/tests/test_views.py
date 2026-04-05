import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@example.com",
        username="testuser",
        password="StrongPass123!",
    )


@pytest.fixture
def auth_client(api_client, user):
    response = api_client.post(
        reverse("auth-login"),
        {"email": "test@example.com", "password": "StrongPass123!"},
        format="json",
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return api_client, response.data


class TestRegister:
    def test_register_success(self, api_client, db):
        response = api_client.post(
            reverse("auth-register"),
            {
                "email": "new@example.com",
                "username": "newuser",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["user"]["email"] == "new@example.com"

    def test_register_duplicate_email(self, api_client, user):
        response = api_client.post(
            reverse("auth-register"),
            {
                "email": "test@example.com",
                "username": "other",
                "password": "StrongPass123!",
                "password_confirm": "StrongPass123!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client, db):
        response = api_client.post(
            reverse("auth-register"),
            {
                "email": "new@example.com",
                "username": "newuser",
                "password": "StrongPass123!",
                "password_confirm": "WrongPass123!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client, db):
        response = api_client.post(
            reverse("auth-register"),
            {
                "email": "new@example.com",
                "username": "newuser",
                "password": "123",
                "password_confirm": "123",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestLogin:
    def test_login_success(self, api_client, user):
        response = api_client.post(
            reverse("auth-login"),
            {"email": "test@example.com", "password": "StrongPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password(self, api_client, user):
        response = api_client.post(
            reverse("auth-login"),
            {"email": "test@example.com", "password": "WrongPassword!"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client, db):
        response = api_client.post(
            reverse("auth-login"),
            {"email": "nobody@example.com", "password": "StrongPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestTokenRefresh:
    def test_refresh_success(self, api_client, user):
        login = api_client.post(
            reverse("auth-login"),
            {"email": "test@example.com", "password": "StrongPass123!"},
            format="json",
        )
        response = api_client.post(
            reverse("auth-refresh"),
            {"refresh": login.data["refresh"]},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_refresh_invalid_token(self, api_client, db):
        response = api_client.post(
            reverse("auth-refresh"),
            {"refresh": "invalid.token.here"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestLogout:
    def test_logout_success(self, api_client, user):
        login = api_client.post(
            reverse("auth-login"),
            {"email": "test@example.com", "password": "StrongPass123!"},
            format="json",
        )
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = api_client.post(
            reverse("auth-logout"),
            {"refresh": login.data["refresh"]},
            format="json",
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_logout_unauthenticated(self, api_client, db):
        response = api_client.post(reverse("auth-logout"), {"refresh": "token"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_missing_refresh(self, api_client, user):
        login = api_client.post(
            reverse("auth-login"),
            {"email": "test@example.com", "password": "StrongPass123!"},
            format="json",
        )
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = api_client.post(reverse("auth-logout"), {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestMe:
    def test_me_authenticated(self, auth_client):
        client, _ = auth_client
        response = client.get(reverse("auth-me"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "test@example.com"

    def test_me_unauthenticated(self, api_client):
        response = api_client.get(reverse("auth-me"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
