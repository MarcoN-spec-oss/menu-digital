from decimal import Decimal

from menu.models import Dish

CART_SESSION_KEY = "cart"
MAX_PER_DISH = 20


class Cart:
    """Carrito en sesión. Guarda solo {id_plato: cantidad}; los precios se leen
    de la BD cada vez, así nunca quedan desactualizados y no hay que guardar
    Decimals en la sesión (no se pueden serializar a JSON)."""

    def __init__(self, request):
        self.session = request.session
        self.cart = self.session.get(CART_SESSION_KEY, {})

    def _save(self):
        self.session[CART_SESSION_KEY] = self.cart
        self.session.modified = True

    def add(self, dish, quantity=1):
        key = str(dish.id)
        self.cart[key] = min(self.cart.get(key, 0) + quantity, MAX_PER_DISH)
        self._save()

    def set_quantity(self, dish, quantity):
        key = str(dish.id)
        if quantity <= 0:
            self.cart.pop(key, None)
        else:
            self.cart[key] = min(quantity, MAX_PER_DISH)
        self._save()

    def remove(self, dish):
        self.cart.pop(str(dish.id), None)
        self._save()

    def clear(self):
        self.cart = {}
        self.session.pop(CART_SESSION_KEY, None)
        self.session.modified = True

    def __iter__(self):
        dishes = Dish.objects.filter(
            pk__in=list(self.cart.keys()), is_available=True
        ).select_related("category")
        for dish in dishes:
            quantity = self.cart[str(dish.id)]
            yield {
                "dish": dish,
                "quantity": quantity,
                "subtotal": dish.price * quantity,
            }

    def __len__(self):
        """Cantidad total de ítems (para el contador del navbar, sin consultar la BD)."""
        return sum(self.cart.values())

    def total(self):
        return sum((item["subtotal"] for item in self), Decimal("0.00"))