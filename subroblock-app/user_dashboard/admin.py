from django.contrib import admin
from user_dashboard import models
from user_dashboard import forms as _forms

admin.site.register(models.Arbitration)
admin.site.register(models.subro_offer_responder)
admin.site.register(models.subro_organization_key)
admin.site.register(models.subro_org_wallet_transaction)
admin.site.register(models.subro_vehicle_vin)
admin.site.register(models.subro_resp_org_vehicle_vin)
admin.site.register(models.subro_offer_org_vehicle_vin)
admin.site.register(models.subro_offer_request_file)
admin.site.register(models.SubroOfferSignature)
admin.site.register(models.SubroResponderSignature)

class SubroBlockUserAdmin(admin.ModelAdmin):
    readonly_fields = ('account_created','last_login','customer_id')
    list_display = ['user_id', 'title', 'account_created', 'last_login']
    list_filter = ['title']
    form = _forms.SubroUserForm

class SubroBlockAccidentAdmin(admin.ModelAdmin):
    form = _forms.SubroOfferRequestForm
    readonly_fields = ('submission_date','modified_date')
    
class SubroBlockSentItemsAdmin(admin.ModelAdmin):
    readonly_fields = ('arbitor_sent_username','block_token',)
    
    def arbitor_sent_username(self, obj):
        return obj.arbitration_id.arbitor_id.user_id.username

class SubroOrganizationAdmin(admin.ModelAdmin):
    form = _forms.SubroOrganizationForm

    def get_form(self, request, obj=None, **kwargs):
        # Dynamically update the choices for the company field
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['company'].queryset = models.subro_organization.objects.values_list('company', flat=True).distinct()
        return form

class SubroWalletAdmin(admin.ModelAdmin):
    readonly_fields = ['funds']


class SubroOrgAdmin(admin.ModelAdmin):

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial['root_user'] = request.user
        return initial

    def save_model(self, request, obj, form, change):
        if obj.pk is None and obj.root_user is None:  # If the object is being created
            obj.root_user = request.user
        super().save_model(request, obj, form, change)


admin.site.register(models.subro_organization, SubroOrgAdmin)
admin.site.register(models.subro_org_wallet, SubroWalletAdmin)
admin.site.register(models.subro_organization_user, SubroOrganizationAdmin)
admin.site.register(models.subroUser, SubroBlockUserAdmin)
admin.site.register(models.subro_offer_request)
admin.site.register(models.sent_block, SubroBlockSentItemsAdmin)