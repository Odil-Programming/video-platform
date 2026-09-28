from django.db.models import (
    F,
    Q,
)

from django_filters.rest_framework import (
    DjangoFilterBackend,
)

from rest_framework import (
    status,
    viewsets,
)

from rest_framework.decorators import (
    action,
)

from rest_framework.filters import (
    OrderingFilter,
    SearchFilter,
)

from rest_framework.parsers import (
    FormParser,
    JSONParser,
    MultiPartParser,
)

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)


from notifications.models import Notification

from .models import Video
from .pagination import VideoPagination
from .permissions import IsOwnerOrAdmin
from .serializers import VideoSerializer


class VideoViewSet(
    viewsets.ModelViewSet
):
    serializer_class = VideoSerializer
    pagination_class = VideoPagination

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "category",
    ]

    search_fields = [
        "title",
        "description",
        "category__name",
    ]

    ordering_fields = [
        "created_at",
        "published_at",
        "views_count",
        "title",
    ]

    ordering = [
        "-published_at",
    ]


    def get_queryset(self):
        user = self.request.user


        approved_videos = (
            Video.objects.filter(
                status=Video.Status.APPROVED,
            )
            .select_related(
                "owner",
                "category",
            )
        )


        all_videos = (
            Video.objects.all()
            .select_related(
                "owner",
                "category",
            )
        )


        # Публичный список.
        #
        # GET /api/videos/
        #
        # Только опубликованные видео.
        if self.action == "list":
            return approved_videos


        # Одна страница видео, просмотры
        # и рекомендации.
        #
        # GET  /api/videos/{id}/
        # POST /api/videos/{id}/view/
        # GET  /api/videos/{id}/recommendations/
        #
        # Гость видит только approved.
        # Авторизованный пользователь видит
        # approved и собственные видео.
        # Администратор видит все видео.
        if self.action in [
            "retrieve",
            "add_view",
            "recommendations",
        ]:
            if (
                user.is_authenticated
                and user.is_staff
            ):
                return all_videos


            if user.is_authenticated:
                return all_videos.filter(
                    Q(
                        status=Video.Status.APPROVED,
                    )
                    | Q(owner=user),
                )


            return approved_videos


        # Свежие опубликованные видео.
        #
        # GET /api/videos/latest/
        if self.action == "latest":
            return (
                approved_videos
                .filter(
                    published_at__isnull=False,
                )
                .order_by(
                    "-published_at",
                )
            )


        # Администратор видит все видео
        # в закрытых действиях.
        if (
            user.is_authenticated
            and user.is_staff
        ):
            return all_videos


        # Обычный пользователь в закрытых
        # действиях видит только свои видео.
        if user.is_authenticated:
            return all_videos.filter(
                owner=user,
            )


        # Гость не получает закрытые данные.
        return Video.objects.none()


    def get_permissions(self):
        # Публичные endpoints.
        if self.action in [
            "list",
            "retrieve",
            "latest",
            "add_view",
            "recommendations",
        ]:
            return [
                AllowAny(),
            ]


        # Создание видео.
        if self.action == "create":
            return [
                IsAuthenticated(),
            ]


        # Личные видео.
        if self.action == "my_videos":
            return [
                IsAuthenticated(),
            ]


        # Модерация.
        if self.action in [
            "approve",
            "reject",
        ]:
            return [
                IsAuthenticated(),
            ]


        # Обновление и удаление видео.
        return [
            IsAuthenticated(),
            IsOwnerOrAdmin(),
        ]


    def perform_create(self, serializer):
        """
        Создает видео со статусом pending
        и уведомление для его владельца.
        """

        video = serializer.save(
            owner=self.request.user,
            status=Video.Status.PENDING,
        )


        Notification.objects.create(
            user=self.request.user,
            video=video,
            notification_type=(
                Notification.NotificationType.VIDEO_SUBMITTED
            ),
            title="Видео отправлено",
            message=(
                f"Видео «{video.title}» отправлено "
                "на модерацию."
            ),
        )


    @action(
        detail=False,
        methods=["get"],
        url_path="latest",
        permission_classes=[
            AllowAny,
        ],
    )
    def latest(self, request):
        """
        GET /api/videos/latest/
        """

        videos = self.get_queryset()

        page = self.paginate_queryset(
            videos,
        )

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
            )

            return self.get_paginated_response(
                serializer.data,
            )

        serializer = self.get_serializer(
            videos,
            many=True,
        )

        return Response(
            serializer.data,
        )


    @action(
        detail=False,
        methods=["get"],
        url_path="my",
        permission_classes=[
            IsAuthenticated,
        ],
    )
    def my_videos(self, request):
        """
        GET /api/videos/my/
        """

        videos = (
            Video.objects.filter(
                owner=request.user,
            )
            .select_related(
                "owner",
                "category",
            )
            .order_by(
                "-created_at",
            )
        )

        page = self.paginate_queryset(
            videos,
        )

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
            )

            return self.get_paginated_response(
                serializer.data,
            )

        serializer = self.get_serializer(
            videos,
            many=True,
        )

        return Response(
            serializer.data,
        )


    @action(
        detail=True,
        methods=["post"],
        url_path="view",
        permission_classes=[
            AllowAny,
        ],
    )
    def add_view(
        self,
        request,
        pk=None,
    ):
        """
        POST /api/videos/{id}/view/

        Увеличивает количество просмотров
        для конкретного видео.
        """

        video = self.get_object()

        Video.objects.filter(
            pk=video.pk,
        ).update(
            views_count=F(
                "views_count",
            ) + 1,
        )

        video.refresh_from_db(
            fields=[
                "views_count",
            ],
        )

        return Response(
            {
                "id": video.id,
                "views_count": video.views_count,
            },
            status=status.HTTP_200_OK,
        )


    @action(
        detail=True,
        methods=["get"],
        url_path="recommendations",
        permission_classes=[
            AllowAny,
        ],
    )
    def recommendations(
        self,
        request,
        pk=None,
    ):
        """
        GET /api/videos/{id}/recommendations/

        Возвращает до 8 опубликованных видео
        из той же категории, исключая текущее.

        Порядок:
        1. Больше просмотров.
        2. Более новые видео.
        """

        video = self.get_object()

        recommended_videos = (
            Video.objects.filter(
                status=Video.Status.APPROVED,
                category=video.category,
            )
            .exclude(
                pk=video.pk,
            )
            .select_related(
                "owner",
                "category",
            )
            .order_by(
                "-views_count",
                "-published_at",
            )[:8]
        )

        serializer = self.get_serializer(
            recommended_videos,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


    @action(
        detail=True,
        methods=["post"],
        url_path="approve",
        permission_classes=[
            IsAuthenticated,
        ],
    )
    def approve(
        self,
        request,
        pk=None,
    ):
        """
        POST /api/videos/{id}/approve/

        Одобрить видео может только
        staff-пользователь.
        """

        if not request.user.is_staff:
            return Response(
                {
                    "detail": (
                        "Только администратор может "
                        "одобрять видео."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        video = self.get_object()

        if (
            video.status
            == Video.Status.APPROVED
        ):
            return Response(
                {
                    "detail": (
                        "Это видео уже опубликовано."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        video.approve()

        Notification.objects.create(
            user=video.owner,
            video=video,
            notification_type=(
                Notification.NotificationType.VIDEO_APPROVED
            ),
            title="Видео опубликовано",
            message=(
                f"Видео «{video.title}» успешно "
                "опубликовано."
            ),
        )

        return Response(
            self.get_serializer(
                video,
            ).data,
            status=status.HTTP_200_OK,
        )


    @action(
        detail=True,
        methods=["post"],
        url_path="reject",
        permission_classes=[
            IsAuthenticated,
        ],
    )
    def reject(
        self,
        request,
        pk=None,
    ):
        """
        POST /api/videos/{id}/reject/

        Отклонить видео может только
        staff-пользователь.
        """

        if not request.user.is_staff:
            return Response(
                {
                    "detail": (
                        "Только администратор может "
                        "отклонять видео."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        reason = request.data.get(
            "reason",
            "",
        ).strip()

        if not reason:
            return Response(
                {
                    "reason": (
                        "Укажите причину отклонения."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        video = self.get_object()

        if (
            video.status
            == Video.Status.REJECTED
        ):
            return Response(
                {
                    "detail": (
                        "Это видео уже отклонено."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        video.reject(reason)

        Notification.objects.create(
            user=video.owner,
            video=video,
            notification_type=(
                Notification.NotificationType.VIDEO_REJECTED
            ),
            title="Видео отклонено",
            message=(
                f"Видео «{video.title}» отклонено. "
                f"Причина: {reason}"
            ),
        )

        return Response(
            self.get_serializer(
                video,
            ).data,
            status=status.HTTP_200_OK,
        )