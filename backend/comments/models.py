from django.conf import settings
from django.db import models


class Comment(models.Model):
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="comments",
        verbose_name="Видео",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
        verbose_name="Пользователь",
    )

    text = models.TextField(
        max_length=1000,
        verbose_name="Комментарий",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Дата обновления",
    )


    class Meta:
        ordering = [
            "-created_at",
        ]

        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"


    def __str__(self):
        return (
            f"{self.user.username}: "
            f"{self.text[:40]}"
        )