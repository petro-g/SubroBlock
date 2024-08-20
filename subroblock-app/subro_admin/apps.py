from django.apps import AppConfig


class SubroAdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'subro_admin'

    def ready(self):
        import subro_admin.signals
