from django.contrib import admin
from .models import PageView, SearchQuery, UserSession, DailyAnalytics


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('page_type', 'user', 'ip_address', 'viewed_at')
    list_filter = ('page_type', 'viewed_at')
    readonly_fields = ('viewed_at',)


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ('query', 'user', 'results_count', 'searched_at')
    search_fields = ('query',)
    readonly_fields = ('searched_at',)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_id', 'started_at', 'ended_at', 'page_views')
    readonly_fields = ('started_at',)


@admin.register(DailyAnalytics)
class DailyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('date', 'unique_visitors', 'total_page_views', 'total_searches')
    ordering = ('-date',)
