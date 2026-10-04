from django.db.models import Q
from django.views.generic import ListView

from .models import Category, Dish


class MenuListView(ListView):
    model = Dish
    template_name = "menu/menu_list.html"
    context_object_name = "dishes"

    def get_queryset(self):
        qs = (
            Dish.objects.filter(is_available=True, category__is_active=True)
            .select_related("category")
            .order_by("category__order", "category__name", "name")
        )
        slug = self.request.GET.get("categoria")
        query = self.request.GET.get("q", "").strip()
        if slug:
            qs = qs.filter(category__slug=slug)
        if query:
            qs = qs.filter(Q(name__icontains=query) | Q(description__icontains=query))
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["categories"] = Category.objects.filter(is_active=True)
        ctx["current_category"] = self.request.GET.get("categoria", "")
        ctx["query"] = self.request.GET.get("q", "").strip()
        return ctx