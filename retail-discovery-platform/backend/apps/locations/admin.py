from django.contrib import admin
from .models import Country, State, City, Locality


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'currency_code', 'is_active')
    search_fields = ('name', 'code')
    list_filter = ('is_active',)


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'code', 'is_active')
    search_fields = ('name', 'code')
    list_filter = ('is_active', 'country')


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'state', 'slug', 'is_active')
    search_fields = ('name', 'slug')
    list_filter = ('is_active', 'state__country')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Locality)
class LocalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'slug', 'postal_code', 'is_active')
    search_fields = ('name', 'postal_code')
    list_filter = ('is_active', 'city')
    prepopulated_fields = {'slug': ('name',)}
