from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from .models import AdminKey
from .permissions import UserPermissions


@receiver(m2m_changed, sender=User.groups.through)
def user_groups_changed(sender, instance, action, **kwargs):
    if action == 'post_add':
        if instance.groups.filter(name=UserPermissions.ADMIN.value).exists():
            if not hasattr(instance, 'admin_key'):
                admin_key = AdminKey(user=instance, key_name=f"{instance.username}AdminKey")
                admin_key.generate_keys()
                admin_key.save()

    elif action == 'post_remove':
        if hasattr(instance, 'admin_key'):
            instance.admin_key.delete()
