from django.urls import path
from .views import TrackPageViewView, TrackSearchView

urlpatterns = [
    path('page-view/', TrackPageViewView.as_view(), name='analytics-page-view'),
    path('search/', TrackSearchView.as_view(), name='analytics-search'),
]
