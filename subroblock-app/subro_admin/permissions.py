from rest_framework import permissions
from enum import Enum

from user_dashboard.models import subro_organization


class UserPermissions(Enum):
    ORG_USER = 'org_user'
    ORG_ROOT = 'org_root'
    ADMIN = 'admin'
    ARBITRATOR = 'arbitrator'


class AdminUserPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.is_staff or request.user.groups.filter(name=UserPermissions.ADMIN.value).exists()


class RootUserPermission(permissions.BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.groups.filter(name=UserPermissions.ORG_ROOT.value).exists():
            self.message = "You are not part of root organization group. i.e org_root"
            return False

        if not subro_organization.objects.filter(root_user=request.user).exists():
            self.message = "You are not associated with any organization."
            return False
        return True


class OrgUserPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.groups.filter(name=UserPermissions.ORG_USER.value).exists()


class ArbitratorPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.groups.filter(name=UserPermissions.ARBITRATOR.value).exists()