from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user,
        ).select_related("video")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="read",
    )
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(
            update_fields=["is_read"],
        )

        return Response(
            self.get_serializer(notification).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["patch"],
        url_path="read-all",
    )
    def mark_all_as_read(self, request):
        self.get_queryset().filter(
            is_read=False,
        ).update(
            is_read=True,
        )

        return Response(
            {
                "detail": (
                    "Все уведомления отмечены "
                    "как прочитанные."
                )
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="unread-count",
    )
    def unread_count(self, request):
        count = self.get_queryset().filter(
            is_read=False,
        ).count()

        return Response(
            {"count": count},
            status=status.HTTP_200_OK,
        )