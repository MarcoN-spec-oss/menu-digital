from rest_framework import serializers
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "user", "full_name", "phone", "email",
            "date", "time", "guests", "special_notes",
            "status", "status_display", "created_at",
        ]
        read_only_fields = ["user", "status", "created_at"]


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["full_name", "phone", "email", "date", "time", "guests", "special_notes"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        return Reservation.objects.create(user=user, **validated_data)