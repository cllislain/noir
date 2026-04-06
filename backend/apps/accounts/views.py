import io
import re
import zipfile

import google.auth.transport.requests
import google.oauth2.id_token
from django.conf import settings
from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .serializers import (
    UsernameTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)


def _slugify(text: str, max_len: int = 50) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:max_len].strip("-")


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"
    serializer_class = UsernameTokenObtainPairSerializer


class RefreshTokenView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    def delete(self, request):
        confirm_email = request.data.get("confirm_email", "").strip().lower()
        if confirm_email != request.user.email.lower():
            return Response(
                {"detail": "Email confirmation does not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."})


class ExportEntriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.entries.models import Entry

        entries = (
            Entry.objects.filter(author=request.user, is_deleted=False)
            .prefetch_related("tags")
            .order_by("created_at")
        )

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for entry in entries:
                date_str = entry.created_at.strftime("%Y-%m-%d")
                slug = _slugify(entry.title) or "untitled"
                filename = f"{date_str}-{slug}.md"

                tags_list = ", ".join(t.name for t in entry.tags.all())
                front_matter = (
                    f"---\n"
                    f"title: {entry.title}\n"
                    f"mood: {entry.mood or 'none'}\n"
                    f"tags: [{tags_list}]\n"
                    f"favorite: {str(entry.is_favorite).lower()}\n"
                    f"created_at: {entry.created_at.isoformat()}\n"
                    f"updated_at: {entry.updated_at.isoformat()}\n"
                    f"---\n\n"
                )
                content = front_matter + entry.body
                zf.writestr(filename, content.encode("utf-8"))

        buf.seek(0)
        response = HttpResponse(buf.read(), content_type="application/zip")
        response["Content-Disposition"] = 'attachment; filename="journal-export.zip"'
        return response


def _make_unique_username(email_prefix: str) -> str:
    """Derive a unique username from an email prefix.

    Strips non-alphanumeric characters and appends a numeric suffix when
    the base username is already taken.
    """
    base = re.sub(r"[^a-z0-9]", "", email_prefix.lower()) or "user"
    base = base[:140]  # leave room for suffix within 150-char limit
    candidate = base
    counter = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}{counter}"
        counter += 1
    return candidate


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request) -> Response:
        credential = request.data.get("credential", "").strip()
        if not credential:
            return Response(
                {"detail": "credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            google_request = google.auth.transport.requests.Request()
            id_info = google.oauth2.id_token.verify_oauth2_token(
                credential,
                google_request,
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except ValueError as exc:
            return Response(
                {"detail": f"Invalid Google token: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email: str = id_info.get("email", "")
        name: str = id_info.get("name", "")
        google_id: str = id_info.get("sub", "")

        if not email:
            return Response(
                {"detail": "Google token did not contain an email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
            # Link google_id if not already set
            if not user.google_id:
                user.google_id = google_id
                user.save(update_fields=["google_id"])
        except User.DoesNotExist:
            email_prefix = email.split("@")[0]
            username = _make_unique_username(email_prefix)
            user = User(
                email=email,
                username=username,
                display_name=name,
                google_id=google_id,
            )
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )
