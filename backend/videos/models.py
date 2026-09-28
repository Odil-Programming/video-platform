from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Video(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "На проверке"
        APPROVED = "approved", "Опубликовано"
        REJECTED = "rejected", "Отклонено"


    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos",
        verbose_name="Автор",
    )

    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="videos",
        verbose_name="Категория",
    )

    title = models.CharField(
        max_length=255,
        verbose_name="Название",
    )

    description = models.TextField(
        blank=True,
        verbose_name="Описание",
    )

    video_file = models.FileField(
        upload_to="videos/%Y/%m/",
        blank=True,
        null=True,
        verbose_name="Видео файл",
    )

    video_url = models.URLField(
        blank=True,
        verbose_name="Ссылка на видео",
    )

    thumbnail = models.ImageField(
        upload_to="thumbnails/%Y/%m/",
        blank=True,
        null=True,
        verbose_name="Превью",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Статус",
    )

    rejection_reason = models.TextField(
        blank=True,
        default="",
        verbose_name="Причина отклонения",
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Дата публикации",
    )

    views_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Количество просмотров",
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
        verbose_name = "Видео"
        verbose_name_plural = "Видео"
        ordering = [
            "-created_at",
        ]


    def clean(self):
        if (
            not self.video_file
            and not self.video_url
        ):
            raise ValidationError(
                "Укажите видеофайл или ссылку "
                "на видео."
            )


        if (
            self.video_file
            and self.video_url
        ):
            raise ValidationError(
                "Укажите только видеофайл или "
                "ссылку на видео."
            )


    def approve(self):
        self.status = self.Status.APPROVED
        self.published_at = timezone.now()
        self.rejection_reason = ""


        self.save(
            update_fields=[
                "status",
                "published_at",
                "rejection_reason",
                "updated_at",
            ]
        )


    def reject(self, reason):
        self.status = self.Status.REJECTED
        self.rejection_reason = reason
        self.published_at = None


        self.save(
            update_fields=[
                "status",
                "rejection_reason",
                "published_at",
                "updated_at",
            ]
        )


    def __str__(self):
        return self.title