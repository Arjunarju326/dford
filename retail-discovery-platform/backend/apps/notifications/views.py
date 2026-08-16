from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from .models import Notification, Announcement


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'channel',
            'offer', 'flyer', 'store', 'is_read', 'is_sent', 'created_at',
        ]
        read_only_fields = ['created_at', 'is_sent']


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/notifications/      — user notifications
    POST /api/notifications/{id}/mark-read/ — mark as read
    POST /api/notifications/mark-all-read/  — mark all read
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'created_by', 'created_by_username',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)
        from apps.accounts.models import User
        from apps.notifications.models import Notification
        from django.utils import timezone

        users = User.objects.filter(is_active=True)
        notifications = [
            Notification(
                user=user,
                title=f"Announcement: {announcement.title}",
                message=announcement.content,
                notification_type='custom',
                channel='in_app',
                is_sent=True,
                sent_at=timezone.now()
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)

