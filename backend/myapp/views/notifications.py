from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Notification
from ..serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Only return notifications for the authenticated user.
        """
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """
        Mark a specific notification as read.
        """
        notification = self.get_object()
        notification.read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """
        Mark all unread notifications for the user as read.
        """
        unread_notifications = self.get_queryset().filter(read=False)
        count = unread_notifications.update(read=True)
        return Response({'message': f'{count} notifications marked as read', 'count': count})
