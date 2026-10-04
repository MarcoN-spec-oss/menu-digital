from django import forms
from django.utils import timezone

from .models import Reservation


class ReservationForm(forms.ModelForm):
    class Meta:
        model = Reservation
        fields = ["full_name", "phone", "email", "date", "time", "guests", "special_notes"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
            "time": forms.TimeInput(attrs={"type": "time"}),
            "guests": forms.NumberInput(attrs={"min": 1, "max": 20}),
            "special_notes": forms.Textarea(attrs={"rows": 3}),
        }

    def clean_date(self):
        date = self.cleaned_data["date"]
        if date < timezone.localdate():
            raise forms.ValidationError("La fecha no puede estar en el pasado.")
        return date