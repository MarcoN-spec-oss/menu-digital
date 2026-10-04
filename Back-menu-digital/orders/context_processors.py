from .cart import Cart


def cart(request):
    return {
        "cart": Cart(request),
        "table_number": request.session.get("table_number"),
    }