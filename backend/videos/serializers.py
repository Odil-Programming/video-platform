from rest_framework import serializers

from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(
        source="owner.username",
        read_only=True,
    )
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = Video
        fields = [
            "id",
            "owner",
            "owner_username",
            "category",
            "category_name",
            "title",
            "description",
            "video_file",
            "video_url",
            "thumbnail",
            "status",
            "rejection_reason",
            "published_at",
            "views_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "owner_username",
            "category_name",
            "status",
            "rejection_reason",
            "published_at",
            "views_count",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        video_file = attrs.get("video_file")
        video_url = attrs.get("video_url")

        if not video_file and not video_url:
            raise serializers.ValidationError({
                "video": (
                    "Загрузите видеофайл или укажите ссылку."
                )
            })

        if video_file and video_url:
            raise serializers.ValidationError({
                "video": (
                    "Нельзя одновременно указать файл и ссылку."
                )
            })

        return attrs
