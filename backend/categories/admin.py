from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "slug",
        "icon",
        "is_active",
        "created_at",
    ]
    list_filter = [
        "is_active",
    ]
    search_fields = [
        "name",
        "slug",
    ]
    prepopulated_fields = {
        "slug": ("name",),
    }
    readonly_fields = [
        "created_at",
    ]