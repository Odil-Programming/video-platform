from django.contrib import admin

from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "owner",
        "category",
        "status",
        "views_count",
        "created_at",
    ]
    list_filter = [
        "status",
        "category",
        "created_at",
    ]
    search_fields = [
        "title",
        "description",
        "owner__username",
    ]
    readonly_fields = [
        "views_count",
        "created_at",
        "updated_at",
        "published_at",
    ]