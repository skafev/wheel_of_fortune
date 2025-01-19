from django.shortcuts import render
from django.http import JsonResponse
import random

# Wheel view: Display the form and wheel
def wheel_view(request):
    return render(request, 'wheel_app/wheel.html')
