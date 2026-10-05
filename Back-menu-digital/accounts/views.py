from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie


def register(request):
    form = UserCreationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect("menu:list")
    return render(request, "accounts/register.html", {"form": form})


@ensure_csrf_cookie
def csrf_token(request):
    """Endpoint to get CSRF token for frontend."""
    return JsonResponse({"csrfToken": get_token(request)})