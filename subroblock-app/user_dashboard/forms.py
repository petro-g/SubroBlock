from django import forms
from django.contrib.auth import get_user_model
from user_dashboard.models import subroUser, subro_organization, subro_organization_user, subro_offer_request

User = get_user_model()

class SubroUserForm(forms.ModelForm):
    class Meta:
        model = subroUser
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(SubroUserForm, self).__init__(*args, **kwargs)
        existing_users = subroUser.objects.all().values_list('user_id', flat=True)
        self.fields['user_id'].queryset = User.objects.exclude(pk__in=existing_users)

class SubroOfferRequestForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(SubroOfferRequestForm, self).__init__(*args, **kwargs)
        self.fields['responderCompany'].widget.choices = self.get_company_choices()

    def get_company_choices(self):
        return [(company, company) for company in subro_organization.objects.all()]

    class Meta:
        model = subro_offer_request
        fields = '__all__'
        widgets = {
            'responderCompany': forms.Select()
        }

class SubroOrganizationForm(forms.ModelForm):
    class Meta:
        model = subro_organization_user
        fields = ['company', 'user']
        widgets = {
            'company': forms.Select(),
            'user': forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        super(SubroOrganizationForm, self).__init__(*args, **kwargs)
        self.fields['company'].queryset = self.get_company_choices()
        self.fields['user'].queryset = self.get_user_queryset()

    def get_company_choices(self):
        return subro_organization.objects.all()

    def get_user_queryset(self):
        existing_users = subro_organization_user.objects.all().values_list('user', flat=True)
        return subroUser.objects.exclude(pk__in=existing_users)    
