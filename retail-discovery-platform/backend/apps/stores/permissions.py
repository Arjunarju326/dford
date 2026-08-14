from rest_framework import permissions

class IsShopOwnerOrAdmin(permissions.BasePermission):
    """
    Permission checking that authenticated user owns the Shop or is platform Admin.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'store') and obj.store:
            return obj.store.owner == request.user
        if hasattr(obj, 'store_branch') and obj.store_branch and obj.store_branch.store:
            return obj.store_branch.store.owner == request.user
        return False
