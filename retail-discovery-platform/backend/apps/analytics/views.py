from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import PageView, SearchQuery


class TrackPageViewView(APIView):
    """POST /api/analytics/page-view/ — track a page view event."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
        PageView.objects.create(
            user=request.user if request.user.is_authenticated else None,
            ip_address=ip,
            page_type=data.get('page_type', 'other'),
            page_url=data.get('page_url', ''),
            referrer=data.get('referrer', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)


class TrackSearchView(APIView):
    """POST /api/analytics/search/ — track a search event."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        SearchQuery.objects.create(
            user=request.user if request.user.is_authenticated else None,
            query=data.get('query', ''),
            results_count=data.get('results_count', 0),
            filters=data.get('filters', {}),
        )
        return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)
