from rest_framework import serializers
from .models import Order, OrderItem
from menu.serializers import DishSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    dish = DishSerializer(read_only=True)
    dish_id = serializers.PrimaryKeyRelatedField(
        queryset=OrderItem.objects.none(), source="dish", write_only=True
    )
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id", "dish", "dish_id", "dish_name", "unit_price",
            "quantity", "subtotal",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from menu.models import Dish
        self.fields["dish_id"].queryset = Dish.objects.filter(is_available=True)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "user", "customer_name", "table_number",
            "status", "status_display", "notes", "total",
            "created_at", "updated_at", "items",
        ]
        read_only_fields = ["user", "total", "created_at", "updated_at", "status"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        table_number = request.session.get("table_number") if request else None
        validated_data["user"] = user
        if table_number:
            validated_data["table_number"] = table_number
        return super().create(validated_data)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_name = serializers.CharField(max_length=100, required=False)
    notes = serializers.CharField(required=False)
    table_number = serializers.IntegerField(required=False)

    class Meta:
        model = Order
        fields = ["customer_name", "table_number", "notes", "items"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        table_number = validated_data.pop("table_number", None) or (request.session.get("table_number") if request else None)

        order = Order.objects.create(
            user=user,
            table_number=table_number,
            customer_name=validated_data.get("customer_name", ""),
            notes=validated_data.get("notes", ""),
            status=Order.Status.PENDING,
        )

        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                dish=item_data["dish"],
                quantity=item_data["quantity"],
            )

        order.recalculate_total()
        return order