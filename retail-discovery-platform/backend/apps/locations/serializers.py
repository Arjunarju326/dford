from rest_framework import serializers
from .models import Country, State, City, Locality


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'code', 'currency_code', 'currency_symbol', 'default_language']


class StateSerializer(serializers.ModelSerializer):
    country_name = serializers.ReadOnlyField(source='country.name')

    class Meta:
        model = State
        fields = ['id', 'name', 'code', 'country', 'country_name']


class CitySerializer(serializers.ModelSerializer):
    state_name = serializers.ReadOnlyField(source='state.name')
    country_name = serializers.ReadOnlyField(source='state.country.name')

    class Meta:
        model = City
        fields = ['id', 'name', 'slug', 'state', 'state_name', 'country_name', 'latitude', 'longitude']


class CityCompactSerializer(serializers.ModelSerializer):
    """Minimal city representation for dropdowns and search."""
    class Meta:
        model = City
        fields = ['id', 'name', 'slug']


class LocalitySerializer(serializers.ModelSerializer):
    city_name = serializers.ReadOnlyField(source='city.name')

    class Meta:
        model = Locality
        fields = ['id', 'name', 'slug', 'city', 'city_name', 'postal_code', 'latitude', 'longitude']
