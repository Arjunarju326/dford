from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserProfile, UserPreference


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'profile_picture', 'preferences']


class UserSerializer(serializers.ModelSerializer):
    """Public user representation."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'user_type', 'phone_number', 'is_verified',
            'is_staff', 'is_superuser', 'preferred_location', 'created_at',
        ]
        read_only_fields = ['id', 'user_type', 'is_verified', 'created_at']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserRegisterSerializer(serializers.ModelSerializer):
    """Registration payload."""
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    phone_number = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'confirm_password', 'phone_number']

    def validate(self, attrs):
        p2 = attrs.get('password2') or attrs.get('confirm_password')
        if p2 and attrs['password'] != p2:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.get_or_create(user=user)
        UserPreference.objects.get_or_create(user=user)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extend JWT token with user info and allow login via username or email."""

    def validate(self, attrs):
        username_or_email = attrs.get('username', '')
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                attrs['username'] = user_obj.username
            except User.DoesNotExist:
                pass
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'notification_enabled', 'email_notifications',
            'push_notifications', 'newsletter', 'language', 'theme',
        ]


class UserAdminSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'user_type', 'phone_number', 'is_verified',
            'is_active', 'is_staff', 'is_superuser', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

