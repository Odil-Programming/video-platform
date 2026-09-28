from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Category.objects.all()

        return Category.objects.filter(
            is_active=True,
        )

    def get_permissions(self):
        if self.action in [
            "list",
            "retrieve",
        ]:
            return [
                AllowAny(),
            ]

        return [
            IsAdminUser(),
        ]