from rest_framework import serializers
from .models import Category, Dish


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "order", "is_active"]


class DishSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Dish
        fields = [
            "id", "name", "description", "price",
            "category", "category_id", "image", "image_url",
            "is_available",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None