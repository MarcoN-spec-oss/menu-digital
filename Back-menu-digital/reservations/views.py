from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import ReservationForm
from .models import Reservation


def reservation_create(request):
    initial = {}
    if request.user.is_authenticated:
        initial = {
            "full_name": request.user.get_full_name() or request.user.username,
            "email": request.user.email,
        }
    form = ReservationForm(request.POST or None, initial=initial)
    if request.method == "POST" and form.is_valid():
        reservation = form.save(commit=False)
        if request.user.is_authenticated:
            reservation.user = request.user
        reservation.save()
        messages.success(
            request, "¡Reserva enviada! Te confirmaremos a la brevedad por teléfono."
        )
        return redirect("reservations:mine" if request.user.is_authenticated else "menu:list")
    return render(request, "reservations/form.html", {"form": form})


@login_required
def my_reservations(request):
    reservations = Reservation.objects.filter(user=request.user).order_by("-date", "-time")
    return render(request, "reservations/my_reservations.html", {"reservations": reservations})


@login_required
@require_POST
def reservation_cancel(request, pk):
    reservation = get_object_or_404(Reservation, pk=pk, user=request.user)
    if reservation.status != Reservation.Status.CANCELLED:
        reservation.status = Reservation.Status.CANCELLED
        reservation.save(update_fields=["status"])
        messages.info(request, "Reserva cancelada.")
    return redirect("reservations:mine")


@staff_member_required
def reservation_manage(request):
    current_status = request.GET.get("estado", "")
    reservations = Reservation.objects.all()
    if current_status in Reservation.Status.values:
        reservations = reservations.filter(status=current_status)
    return render(
        request,
        "reservations/manage.html",
        {
            "reservations": reservations,
            "statuses": Reservation.Status.choices,
            "current_status": current_status,
        },
    )


@staff_member_required
@require_POST
def reservation_set_status(request, pk):
    reservation = get_object_or_404(Reservation, pk=pk)
    new_status = request.POST.get("status")
    if new_status in Reservation.Status.values:
        reservation.status = new_status
        reservation.save(update_fields=["status"])
        messages.success(request, f"Reserva de {reservation.full_name}: {reservation.get_status_display()}.")
    return redirect("reservations:manage")