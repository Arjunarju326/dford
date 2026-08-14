from django.contrib import admin
from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'channel', 'is_read', 'is_sent', 'created_at')
    list_filter = ('notification_type', 'channel', 'is_read', 'is_sent')
    search_fields = ('user__username', 'title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'subject')
