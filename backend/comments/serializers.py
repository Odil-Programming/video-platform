from rest_framework import serializers

from .models import Comment


class CommentSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )


    class Meta:
        model = Comment

        fields = [
            "id",
            "video",
            "user",
            "username",
            "text",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "username",
            "created_at",
            "updated_at",
        ]