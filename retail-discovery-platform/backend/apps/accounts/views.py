from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import update_session_auth_hash

from .models import User, UserPreference
from .serializers import (
    UserRegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    UserPreferenceSerializer,
    UserAdminSerializer,
)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — public registration."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Account created successfully.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — returns JWT access + refresh tokens."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklists the refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — current authenticated user."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({'message': 'Password updated successfully.'})


class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/preferences/"""
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        pref, _ = UserPreference.objects.get_or_create(user=self.request.user)
        return pref


class PermissionListAPIView(APIView):
    """GET /api/v1/permissions/ — List all granular system permissions."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .models import ShopPermission
        perms = ShopPermission.objects.all().order_by('category', 'code')
        serialized = [
            {
                'id': p.id,
                'code': p.code,
                'name': p.name,
                'category': p.category,
                'description': p.description,
            }
            for p in perms
        ]
        return Response(serialized)


class UserPermissionsListAPIView(APIView):
    """GET /api/v1/users/permissions/ — List users and their assigned permissions."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .models import ShopPermission, UserShopPermission
        users = User.objects.all().order_by('id')
        perms = ShopPermission.objects.all()

        user_list = []
        for u in users:
            assigned_map = {}
            for usp in UserShopPermission.objects.filter(user=u, is_granted=True):
                assigned_map[usp.permission.code] = True

            # Super admin has all permissions automatically
            if u.is_superuser or u.is_staff or u.user_type == 'admin':
                for p in perms:
                    assigned_map[p.code] = True

            user_list.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'user_type': u.user_type,
                'is_superuser': u.is_superuser,
                'is_staff': u.is_staff,
                'permissions': assigned_map,
            })

        return Response(user_list)


class UserPermissionToggleAPIView(APIView):
    """POST /api/v1/users/<int:user_id>/permissions/ — Toggle/grant permission for user."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, user_id):
        from .models import ShopPermission, UserShopPermission
        try:
            user = User.objects.get(pk=user_id)
            perm_code = request.data.get('permission_code')
            is_granted = request.data.get('is_granted', True)

            perm = ShopPermission.objects.get(code=perm_code)
            usp, created = UserShopPermission.objects.get_or_create(
                user=user,
                permission=perm,
                store=None,
                branch=None,
            )
            usp.is_granted = bool(is_granted)
            usp.save()

            return Response({
                'message': f"Permission '{perm.name}' {'granted to' if is_granted else 'revoked from'} {user.username}.",
                'user_id': user.id,
                'permission_code': perm.code,
                'is_granted': usp.is_granted,
            })
        except (User.DoesNotExist, ShopPermission.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/admin/users/ — list all registered users for administrators."""
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']

    def get_queryset(self):
        return User.objects.all().order_by('-created_at')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/admin/users/{id}/ — manage specific user account."""
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        user_type = serializer.validated_data.get('user_type')
        if user_type is not None:
            if user_type == 'admin':
                serializer.validated_data['is_staff'] = True
            else:
                serializer.validated_data['is_staff'] = False
        serializer.save()

