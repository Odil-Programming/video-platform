from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        VIDEO_SUBMITTED = (
            "video_submitted",
            "Видео отправлено на проверку",
        )
        VIDEO_APPROVED = (
            "video_approved",
            "Видео одобрено",
        )
        VIDEO_REJECTED = (
            "video_rejected",
            "Видео отклонено",
        )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        verbose_name="Пользователь",
    )
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
        verbose_name="Видео",
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        verbose_name="Тип уведомления",
    )
    title = models.CharField(
        max_length=255,
        verbose_name="Заголовок",
    )
    message = models.TextField(
        verbose_name="Сообщение",
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name="Прочитано",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания",
    )

    class Meta:
        verbose_name = "Уведомление"
        verbose_name_plural = "Уведомления"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.title}"