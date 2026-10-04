class TableMiddleware:
    """Si la URL trae ?mesa=N, guarda N en la sesión para usarla al hacer el pedido."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        mesa = request.GET.get("mesa", "")
        if mesa.isdigit() and 1 <= int(mesa) <= 99:
            request.session["table_number"] = int(mesa)
        return self.get_response(request)