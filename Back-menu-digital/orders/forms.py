from django import forms

from .models import Order


class CheckoutForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ["table_number", "customer_name", "notes"]
        labels = {
            "table_number": "Número de mesa",
            "customer_name": "Tu nombre (opcional)",
            "notes": "Observaciones (opcional)",
        }
        widgets = {
            "table_number": forms.NumberInput(attrs={"min": 1, "max": 99}),
            "notes": forms.Textarea(attrs={"rows": 3}),
        }

    def clean_table_number(self):
        number = self.cleaned_data["table_number"]
        if not 1 <= number <= 99:
            raise forms.ValidationError("El número de mesa debe estar entre 1 y 99.")
        return number