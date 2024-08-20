from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

from user_dashboard.models import subro_offer_request


class ArbitratorUserActionsLogs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class LogType(models.TextChoices):
        APPROVE_CLAIM = 'APPROVE_CLAIM', _('APPROVE_CLAIM')
        REJECT_CLAIM = 'REJECT_CLAIM', _('REJECT_CLAIM')

    log_type = models.CharField(
        max_length=20, choices=LogType.choices, default=LogType.APPROVE_CLAIM)

    offer = models.ForeignKey(subro_offer_request, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.email + self.log_type.lower()

#
# @receiver(pre_save, sender=ArbitratorUserActionsLogs)
# def pre_save_handler(sender, instance, **kwargs):
#     if instance.user.groups.filter(name=UserPermissions.ARBITRATOR.value).exists()
#     instance.field = some_value
