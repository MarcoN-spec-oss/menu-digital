from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from menu.models import Dish

from .cart import Cart
from .forms import CheckoutForm
from .models import Order, OrderItem


def _is_ajax(request):
    return request.headers.get("x-requested-with") == "XMLHttpRequest"


def _redirect_next(request, default="menu:list"):
    nxt = request.POST.get("next", "")
    if nxt and url_has_allowed_host_and_scheme(nxt, allowed_hosts={request.get_host()}):
        return redirect(nxt)
    return redirect(default)


def cart_detail(request):
    return render(request, "orders/cart.html")


@require_POST
def cart_add(request, dish_id):
    dish = get_object_or_404(Dish, pk=dish_id, is_available=True)
    cart = Cart(request)
    cart.add(dish)
    if _is_ajax(request):
        return JsonResponse(
            {"count": len(cart), "message": f"«{dish.name}» añadido al carrito"}
        )
    messages.success(request, f"«{dish.name}» añadido al carrito.")
    return _redirect_next(request)


@require_POST
def cart_update(request, dish_id):
    dish = get_object_or_404(Dish, pk=dish_id)
    try:
        quantity = int(request.POST.get("quantity", 1))
    except ValueError:
        quantity = 1
    Cart(request).set_quantity(dish, quantity)
    return redirect("orders:cart")


@require_POST
def cart_remove(request, dish_id):
    dish = get_object_or_404(Dish, pk=dish_id)
    Cart(request).remove(dish)
    return redirect("orders:cart")


def checkout(request):
    cart = Cart(request)
    items = list(cart)
    if not items:
        messages.warning(request, "Tu carrito está vacío.")
        return redirect("menu:list")

    if request.method == "POST":
        form = CheckoutForm(request.POST)
        if form.is_valid():
            with transaction.atomic():
                order = form.save(commit=False)
                if request.user.is_authenticated:
                    order.user = request.user
                order.save()
                for item in items:
                    # OrderItem.save() congela el precio y el nombre del plato
                    OrderItem.objects.create(
                        order=order, dish=item["dish"], quantity=item["quantity"]
                    )
                order.recalculate_total()

            cart.clear()
            request.session["table_number"] = order.table_number
            # El invitado (sin login) podrá ver su pedido gracias a esta lista
            order_ids = request.session.get("order_ids", [])
            order_ids.append(order.pk)
            request.session["order_ids"] = order_ids
            return redirect("orders:confirmation", pk=order.pk)
    else:
        initial = {"table_number": request.session.get("table_number")}
        if request.user.is_authenticated:
            initial["customer_name"] = request.user.get_full_name() or request.user.username
        form = CheckoutForm(initial=initial)

    return render(request, "orders/checkout.html", {"form": form, "items": items})


def order_confirmation(request, pk):
    order = get_object_or_404(Order.objects.prefetch_related("items"), pk=pk)
    is_owner = request.user.is_authenticated and order.user_id == request.user.id
    in_session = pk in request.session.get("order_ids", [])
    if not (is_owner or in_session or request.user.is_staff):
        raise Http404
    return render(request, "orders/confirmation.html", {"order": order})


@login_required
def my_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related("items")
    return render(request, "orders/my_orders.html", {"orders": orders})


# ---------- Panel de cocina (solo staff) ----------

@staff_member_required
def kitchen_panel(request):
    active = (
        Order.objects.filter(
            status__in=[Order.Status.PENDING, Order.Status.PREPARING]
        )
        .prefetch_related("items")
        .order_by("created_at")
    )
    pending = [o for o in active if o.status == Order.Status.PENDING]
    preparing = [o for o in active if o.status == Order.Status.PREPARING]
    return render(
        request,
        "orders/kitchen.html",
        {"pending": pending, "preparing": preparing},
    )


@staff_member_required
@require_POST
def order_set_status(request, pk):
    order = get_object_or_404(Order, pk=pk)
    new_status = request.POST.get("status")
    if new_status in Order.Status.values:
        order.status = new_status
        order.save(update_fields=["status", "updated_at"])
        messages.success(
            request, f"Pedido #{order.pk} (mesa {order.table_number}): {order.get_status_display()}."
        )
    return redirect("orders:kitchen")