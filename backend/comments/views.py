from rest_framework import viewsets

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from .models import Comment
from .permissions import IsCommentOwnerOrAdmin
from .serializers import CommentSerializer


class CommentViewSet(
    viewsets.ModelViewSet
):
    serializer_class = CommentSerializer


    def get_queryset(self):
        queryset = (
            Comment.objects.select_related(
                "user",
                "video",
            )
            .order_by(
                "-created_at",
            )
        )

        video_id = self.request.query_params.get(
            "video",
        )

        if video_id:
            queryset = queryset.filter(
                video_id=video_id,
            )

        return queryset


    def get_permissions(self):
        # Гость может читать комментарии.
        if self.action in [
            "list",
            "retrieve",
        ]:
            return [
                AllowAny(),
            ]

        # Авторизованный пользователь
        # может создать комментарий.
        if self.action == "create":
            return [
                IsAuthenticated(),
            ]

        # Редактировать или удалять комментарий
        # может автор комментария либо администратор.
        if self.action in [
            "update",
            "partial_update",
            "destroy",
        ]:
            return [
                IsAuthenticated(),
                IsCommentOwnerOrAdmin(),
            ]

        return [
            IsAuthenticated(),
        ]


    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )