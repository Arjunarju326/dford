from rest_framework import serializers
from .models import Store, StoreBranch, StoreCategory, StoreImage, StoreRating

class StoreBranchSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    locality_name = serializers.CharField(source='locality.name', read_only=True)
    city = serializers.PrimaryKeyRelatedField(read_only=False, required=False, allow_null=True, queryset=StoreBranch._meta.get_field('city').remote_field.model.objects.all())
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True, default=0.0)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True, default=0.0)
    location_url = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = StoreBranch
        fields = [
            'id', 'store', 'name', 'slug', 'country', 'state', 'city', 'city_name',
            'locality', 'locality_name', 'postal_code', 'address', 'location_url', 'latitude', 'longitude',
            'phone', 'opening_time', 'closing_time', 'opening_hours', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'store', 'slug', 'created_at']


class ShopRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            'name', 'legal_name', 'owner_name', 'email', 'phone', 'description',
            'logo_url', 'banner_url', 'website', 'country', 'state', 'city',
            'locality', 'postal_code', 'address', 'latitude', 'longitude'
        ]

    def create(self, validated_data):
        from apps.accounts.models import User
        from django.utils.crypto import get_random_string
        from .utils import send_shop_welcome_email

        email = validated_data.get('email')
        owner_name = validated_data.get('owner_name', '')
        shop_name = validated_data.get('name', '')

        user = None
        if email:
            # Generate a new random password
            generated_password = get_random_string(10)

            user = User.objects.filter(email__iexact=email).first()
            if not user:
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=generated_password,
                    first_name=owner_name,
                    user_type='user',
                    is_active=True,
                    is_verified=True
                )
            else:
                user.set_password(generated_password)
                user.save()

            # Trigger the welcome email with credentials
            send_shop_welcome_email(shop_name, owner_name, email, generated_password)

        req_user = self.context['request'].user
        if not user and req_user and req_user.is_authenticated:
            user = req_user

        validated_data['owner'] = user
        validated_data['status'] = 'PENDING_APPROVAL'
        validated_data['is_active'] = False
        return super().create(validated_data)


class ShopDetailSerializer(serializers.ModelSerializer):
    branches = StoreBranchSerializer(many=True, read_only=True)
    branch_count = serializers.IntegerField(source='branches.count', read_only=True)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'legal_name', 'owner_name', 'email', 'phone',
            'description', 'logo_url', 'banner_url', 'website', 'country', 'state',
            'city', 'locality', 'postal_code', 'address', 'latitude', 'longitude',
            'status', 'rejection_reason', 'is_active', 'is_featured', 'branches',
            'branch_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'status', 'rejection_reason', 'is_active', 'created_at', 'updated_at']


class ShopAdminSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    branches = StoreBranchSerializer(many=True, read_only=True)

    class Meta:
        model = Store
        fields = '__all__'

