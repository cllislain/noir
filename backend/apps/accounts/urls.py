from django.urls import path

from .views import (
    ChangePasswordView,
    ExportEntriesView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    MeView,
    RefreshTokenView,
    RegisterView,
)

urlpatterns = [
    path("register/",        RegisterView.as_view(),        name="auth-register"),
    path("login/",           LoginView.as_view(),           name="auth-login"),
    path("refresh/",         RefreshTokenView.as_view(),    name="auth-refresh"),
    path("logout/",          LogoutView.as_view(),          name="auth-logout"),
    path("me/",              MeView.as_view(),              name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(),  name="auth-change-password"),
    path("export/",          ExportEntriesView.as_view(),   name="auth-export"),
    path("google/",          GoogleLoginView.as_view(),     name="auth-google"),
]
