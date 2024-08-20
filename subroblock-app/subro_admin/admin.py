from django.contrib import admin

from subro_admin.models import SubroCoins, ActionsLogs, AdminKey

admin.site.register(SubroCoins)
admin.site.register(ActionsLogs)
admin.site.register(AdminKey)
