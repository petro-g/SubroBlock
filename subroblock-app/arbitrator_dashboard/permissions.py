from enum import Enum
from rest_framework.permissions import BasePermission


class UserPermissions(Enum):
    ORG_USER = 'org_user'
    ORG_ROOT = 'org_root'
    ADMIN = 'admin'
    ARBITRATOR = 'arbitrator'


class IsArbitrator(BasePermission):
    message = "You are not part of ARBITRATOR group."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.groups.filter(name=UserPermissions.ARBITRATOR.value).exists()
