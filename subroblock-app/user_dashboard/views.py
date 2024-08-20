import io
import zipfile
from typing import Any

import boto3
import uuid
from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Q, Exists, OuterRef
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils import timezone
from django_filters.rest_framework.backends import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import NotFound
from rest_framework.filters import SearchFilter
from rest_framework_simplejwt.authentication import JWTAuthentication

from subro_admin.models import SubroKey
from subro_admin.permissions import RootUserPermission, OrgUserPermission, AdminUserPermission, UserPermissions
from subro_admin.serializers import OfferAdminSerializer
from subroblock.exceptions import APIExceptions
from user_dashboard import models
from user_dashboard import serializers
from botocore.exceptions import NoCredentialsError
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.middleware.csrf import get_token
from rest_framework import generics, status
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets

from user_dashboard.filters import ListReceivedOffersFilter, SortingFilterBackend, ListSentOffersFilter
from user_dashboard.models import ResetPassword, subroUser, subro_organization_user, subro_offer_request, \
    subro_offer_responder, subro_resp_org_vehicle_vin, subro_offer_request_file, RequestOfferStatus, \
    subro_org_wallet_transaction, subro_org_wallet, SubroOfferSignature, SubroResponderSignature, ResponderOfferStatus
from user_dashboard.serializers import LoginSerializer, PasswordResetSerializer, PasswordResetValidateSerializer, \
    UpdatePasswordSerializer, UserSerializer, WhoAmISerializer, SubroOfferSerializer, \
    SubroRespVinSerializer, SubroUserSerializer, SuspendUserSerializer, CreateOfferResponseSerializer, \
    AWSSignedS3Serializer, OfferAttachmentSerializer, ListOffersSerializer, InitiateMultipartUploadSerializer, \
    MultiPartPresignedUrlSerializer, CompleteMultipartUploadSerializer, OfferRetrieveSerializer, \
    ListOffersReceivedSerializer

User = get_user_model()

from user_dashboard.models import subroUser, subro_organization_user, subro_organization


from user_dashboard.models import subroUser, subro_organization_user, subro_organization


# from user_dashboard.serializers import PasswordResetSerializer, PasswordResetValidateSerializer, \
#     UpdatePasswordSerializer


# import jwt

# def get_user_from_token(token):
#     try:
#         decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
#         user_id = decoded_token.get('user_id')
#         # Assuming you have a User model
#         user = User.objects.get(id=user_id)
#         return user
#     except jwt.ExpiredSignatureError:
#         # Handle expired token
#         return None
#     except (jwt.InvalidTokenError, User.DoesNotExist):
#         # Handle invalid token or user not found
#         return None


class CustomAuthBackend:
    def authenticate(self, request, email=None, password=None):
        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = CustomAuthBackend().authenticate(request, email=email, password=password)
            if user:
                instance = subro_organization_user.objects.filter(user__user_id_id=user.id).first()
                if instance and instance.company.status == subro_organization.Status.SUSPEND:
                    return Response({'error': 'Organization status is suspend.'}, status=status.HTTP_403_FORBIDDEN)

                login(request, user)
                refresh = RefreshToken.for_user(user)
                csrf_token = get_token(request)
                return Response({
                    'message': 'Index successful',
                    'user': LoginSerializer(user, context={'org_user': instance}).data,
                    'refresh_token': str(refresh),
                    'access_token': str(refresh.access_token),
                    'csrf_token': csrf_token
                }, status=status.HTTP_201_CREATED)

            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(generics.GenericAPIView):
    permission_classes = ()
    serializer_class = PasswordResetSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.send_email()
            return Response({
                'message': "We have emailed the reset instructions if your email is registered."},
                status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordValidateView(generics.GenericAPIView):
    permission_classes = ()
    serializer_class = PasswordResetValidateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            if not ResetPassword.objects.filter(token=token).exists():
                return Response({
                    "error": {
                        "message": "Token is invalid.",
                        "code": "TOKEN_INVALID"
                    }
                }, status=status.HTTP_401_UNAUTHORIZED)

            instance = ResetPassword.objects.get(token=token)
            if not instance.is_valid or instance.is_expired:
                return Response({
                    "error": {
                        "message": "Reset link has expired. Please request a new password reset link.",
                        "code": "TOKEN_EXPIRED"
                    }
                }, status=status.HTTP_401_UNAUTHORIZED)

            return Response({}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatePasswordView(generics.GenericAPIView):
    permission_classes = ()
    serializer_class = UpdatePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            data, is_error = serializer.update_password()
            if is_error:
                return Response(data, status=status.HTTP_404_NOT_FOUND)
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendPasswordViewSet(generics.GenericAPIView):
    permission_classes = ()
    authentication_classes = ()
    serializer_class = PasswordResetSerializer

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.send_email()
            return Response({'message': "We have emailed the reset instructions if your email is registered."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response(e.args, status=status.HTTP_400_BAD_REQUEST)


class CreateUserAPIView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            models.subroUser.objects.get_or_create(user_id=user)
            # Create JWT tokens
            refresh = RefreshToken.for_user(user)
            csrf_token = get_token(request)

            return Response({
                'message': 'User created successfully',
                'refresh_token': str(refresh),
                'access_token': str(refresh.access_token),
                'csrf_token': csrf_token
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WhoAmIView(generics.RetrieveAPIView):

    @swagger_auto_schema(
        responses={
            200: openapi.Response(
                description="User information retrieved successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'user': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email of the user'),
                                'firstName': openapi.Schema(type=openapi.TYPE_STRING,
                                                             description='First name of the user'),
                                'lastName': openapi.Schema(type=openapi.TYPE_STRING,
                                                            description='Last name of the user'),
                                'hasKeyAssigned': openapi.Schema(type=openapi.TYPE_BOOLEAN,
                                                                 description='Whether the user has a key assigned'),
                                'organization': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'organizationid': openapi.Schema(type=openapi.TYPE_INTEGER,
                                                                         description='ID of the organization'),
                                        'name': openapi.Schema(type=openapi.TYPE_STRING,
                                                               description='Name of the organization'),
                                        'rootUserEmail': openapi.Schema(type=openapi.TYPE_STRING,
                                                                        description='Email of the root user of the organization'),
                                    }
                                ),
                                'roles': openapi.Schema(
                                    type=openapi.TYPE_ARRAY,
                                    items=openapi.Schema(type=openapi.TYPE_STRING),
                                    description='List of roles (groups) the user belongs to'
                                )
                            }
                        ),
                        'message': openapi.Schema(type=openapi.TYPE_STRING, description='Response message')
                    }
                )
            ),
            404: openapi.Response(
                description="User not found",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        }
    )
    def get(self, request):
        org_user = subro_organization_user.objects.get(user__user_id=self.request.user)
        if not org_user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user = org_user.user.user_id
        return Response(data={'user': {
            'email': user.username,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'hasKeyAssigned': SubroKey.objects.filter(assigned_user=org_user).exists(),
            'organization': {
                "organizationid": org_user.company.id,
                "name": org_user.company.company,
                "rootUserEmail": org_user.company.root_user.username,
            },
            'roles': list(user.groups.values_list('name', flat=True))
        }, 'message': 'Index succesfull'}, status=status.HTTP_200_OK)


class UserDetailAPIView(APIView):

    def post(self, request):
        serializer = SubroUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateUserAPIView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = subro_organization_user.objects.all()

    def get_serializer_class(self):
        return SuspendUserSerializer

    def put(self, request, *args, **kwargs):
        try:
            serializer = SuspendUserSerializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            serializer.check_permissions()
            user = serializer.update_user(kwargs['pk'])
            return Response({
                "userId": user.id,
                "status": "ACTIVE" if user.is_active else "SUSPENDED",
                "success": True
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class AccidentListAPIView(generics.ListCreateAPIView):
    queryset = subro_offer_request.objects.all()
    serializer_class = SubroOfferSerializer


class AccidentDetailAPIView(generics.CreateAPIView):
    queryset = subro_offer_request.objects.all()
    serializer_class = SubroOfferSerializer

    def post(self, request):
        request.data['requestor'] = subro_organization_user.objects.get(user__user_id=request.user).id
        serializer = SubroOfferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CaseAndOfferView(APIView):
    def get(self, request, *args, **kwargs):
        get_user_company = subro_organization_user.objects.get(user__user_id=request.user)
        cases = subro_offer_request.objects.filter(requestor__company=get_user_company.company)
        data = []
        for case_instance in cases:
            offer_instances = subro_offer_responder.objects.filter(
                subro_offer_request_id=case_instance).order_by('-modified_date')
            case_serializer = SubroOfferSerializer(case_instance)
            offer_serializer = SubroOfferSerializer(offer_instances, many=True)
            case_data = {
                'case': case_serializer.data,
                'offers': offer_serializer.data,
            }
            data.append(case_data)
        return Response(data)


class OfferListAPIView(generics.ListCreateAPIView):
    serializer_class = SubroOfferSerializer

    def get_queryset(self):
        # Filter the queryset based on the user's ID
        return subro_offer_responder.objects.all().exclude(
            offer_sent_by__user_id__user=self.request.user).order_by('-modified_date')

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)


class OfferDetailAPIView(APIView):
    serializer_class = SubroOfferSerializer

    def get_queryset(self):
        # Filter the queryset based on the user's ID
        return subro_offer_responder.objects.filter(offer_sent_by__user_id=self.request.user.id).order_by(
            '-modified_date')

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)


class AWSUploadS3(APIView):
    parser_classes = [FileUploadParser]

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        # AWS credentials
        self.AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID
        self.AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY

        # Bucket name and file names
        self.BUCKET_NAME = settings.BUCKET_NAME
        self.FILE_NAME = 'file_to_upload.txt'
        self.DOWNLOAD_FILE_NAME = 'downloaded_file.txt'
        self.files = []
        self.success_files = []
        self.failed_files = []

    # Upload file to S3 bucket
    def upload_to_s3(self, company, folder_name):
        s3 = boto3.client('s3', aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY)
        for file_obj in self.files:
            try:
                s3.upload_fileobj(file_obj, self.BUCKET_NAME, f"{company}/{folder_name}/{file_obj.name}")
                self.success_files.append(file_obj.name)
            except NoCredentialsError:
                self.failed_files.append(file_obj.name)

    # List files in S3 bucket folder
    def list_s3_dir(self, company, folder_name):
        s3 = boto3.client('s3', aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY)
        try:
            response = s3.list_objects_v2(Bucket=self.BUCKET_NAME, Prefix=f"{company}/{folder_name}/")
            if 'Contents' in response:
                file_list_content = []
                prefix_len = len(f"{company}/{folder_name}/")
                for obj in response['Contents']:
                    if obj['Key'][prefix_len:]:
                        file_name = obj['Key'][prefix_len:].split("/")[-1]
                        file_list_content.append(
                            {"company": company, "folder_name": folder_name, "full_path": f"{obj['Key']}",
                             "file_name": f"{file_name}"})
                return file_list_content
            else:
                return []
        except NoCredentialsError:
            print("Credentials not available")
            return []

    def get(self, request):
        # Retrieve company and folder name from query parameters
        company = request.query_params.get('company')
        folder_name = request.query_params.get('folder_name')

        if not company or not folder_name:
            return Response({"message": "Company name and folder name are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        # List files in the specified folder
        file_list = self.list_s3_dir(company, folder_name)

        return Response({"files": file_list}, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        self.files = request.FILES.getlist('files')
        company = request.query_params.get('company')
        folder_name = request.query_params.get('folder_name')

        # Upload file
        self.upload_to_s3(company=company, folder_name=folder_name)
        if self.failed_files:
            return Response({"message": "Some files failed to upload", "failed_files": self.failed_files},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"message": "All files uploaded successfully", "success_files": self.success_files},
                            status=status.HTTP_201_CREATED)


class AWSSignedUrlS3(generics.GenericAPIView):
    UPLOAD_PERMISSIONS = ['put_object', 'get_object', 'delete_object']
    serializer_class = AWSSignedS3Serializer

    def retrieve_signed_url(self, company, folderName, fileName, permission, expiration=3600):
        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID, aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        fileName, fileType = fileName.split('.')
        try:
            file_uuid = str(uuid.uuid4())
            if permission != 'put_object':
                file_uuid = fileName
            file_key = f'{company}/{folderName}/{file_uuid}.{fileType}'
            return (file_uuid,
                    file_key,
                    s3.generate_presigned_url(permission, Params={'Bucket': settings.BUCKET_NAME, 'Key': file_key}, ExpiresIn=expiration))
        except NoCredentialsError:
            print("Credentials not available")
            return None

    @swagger_auto_schema(
        request_body=AWSSignedS3Serializer,
        responses={
            200: openapi.Response(
                description="Signed URL details",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'url': openapi.Schema(type=openapi.TYPE_STRING, description='Signed URL'),
                        'uuid': openapi.Schema(type=openapi.TYPE_STRING, description='UUID of the file'),
                        'key': openapi.Schema(type=openapi.TYPE_STRING, description='S3 key of the file'),
                        'fileFormat': openapi.Schema(type=openapi.TYPE_STRING, description='Type of the file'),
                        'fileName': openapi.Schema(type=openapi.TYPE_STRING, description='Name of the file')
                    }
                )
            ),
            400: "Invalid permission, valid choices are: ['put_object', 'get_object', 'delete_object']",
            500: "Failed to retrieve signed URL"
        }
    )
    def post(self, request):
        if not request.data.get('permission') in self.UPLOAD_PERMISSIONS:
            return Response({"message": f"Invalid permission, valid choices are: {self.UPLOAD_PERMISSIONS}"}, status=status.HTTP_400_BAD_REQUEST)


        serializer = AWSSignedS3Serializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data.get('permission') == self.UPLOAD_PERMISSIONS[2]:
                organization_user = subro_organization_user.objects.get(user__user_id=request.user)
                if int(serializer.validated_data.get('company')) != organization_user.company.id:
                    return Response({"message": "Unauthorized access"}, status=status.HTTP_401_UNAUTHORIZED)

            if '.' not in serializer.validated_data.get('fileName'):
                return Response({"message": "Invalid file name"}, status=status.HTTP_400_BAD_REQUEST)
            file_uuid, key, url = self.retrieve_signed_url(**serializer.validated_data)
            if url:
                return Response(status=status.HTTP_200_OK,
                                data={'url': url,
                                      'uuid': file_uuid,
                                      'key': key,
                                      'fileFormat': f".{serializer.validated_data.get('fileName').split('.')[1]}",
                                      'fileName': serializer.validated_data.get('fileName').split('.')[0]
                                      }
                                )
            return Response({"message": "Failed to retrieve signed URL"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InitiateMultipartUploadView(generics.GenericAPIView):

    def get_serializer_class(self):
        return InitiateMultipartUploadSerializer

    @swagger_auto_schema(
        request_body=InitiateMultipartUploadSerializer,
        responses={
            200: openapi.Response(
                description="Multipart upload initiated successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'uploadId': openapi.Schema(type=openapi.TYPE_STRING,
                                                   description='The ID of the initiated multipart upload'),
                        'key': openapi.Schema(type=openapi.TYPE_STRING,
                                              description='The key for the file being uploaded'),
                        'uuid': openapi.Schema(type=openapi.TYPE_STRING, format='uuid',
                                               description='The UUID for the file being uploaded'),
                        'fileFormat': openapi.Schema(type=openapi.TYPE_STRING,
                                                   description='The type of the file being uploaded'),
                        'fileName': openapi.Schema(type=openapi.TYPE_STRING,
                                                   description='The name of the file being uploaded')
                    }
                )
            ),
            500: openapi.Response(description="Credentials not available")
        }
    )
    def post(self, request):
        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            if '.' not in serializer.validated_data.get('fileName'):
                return Response({"message": "Invalid file name"}, status=status.HTTP_400_BAD_REQUEST)
            company = serializer.validated_data.get('company')
            folder_name = serializer.validated_data.get('folderName')
            file_name = serializer.validated_data.get('fileName').split('.')[0]
            file_format = f".{serializer.validated_data.get('fileName').split('.')[1]}"
            file_uuid = str(uuid.uuid4())
            file_key = f'{company}/{folder_name}/{file_uuid}{file_format}'
            response = s3.create_multipart_upload(Bucket=settings.BUCKET_NAME, Key=file_key)
            return Response({
                'uploadId': response['UploadId'],
                'key': file_key,
                'uuid': file_uuid,
                'fileFormat': file_format,
                'fileName': file_name
            }, status=status.HTTP_200_OK)
        except NoCredentialsError:
            return Response({"message": "Credentials not available"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MultiPartPresignedUrlView(generics.GenericAPIView):

    def get_serializer_class(self):
        return MultiPartPresignedUrlSerializer

    @swagger_auto_schema(
        request_body=MultiPartPresignedUrlSerializer,
        responses={
            200: openapi.Response(
                description="Presigned URL for uploading a part",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'url': openapi.Schema(type=openapi.TYPE_STRING,
                                              description='Presigned URL for uploading a part')
                    }
                )
            ),
            500: "Credentials not available"
        }
    )
    def post(self, request):
        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            key = serializer.validated_data.get('key')
            upload_id = serializer.validated_data.get('uploadId')
            part_number = serializer.validated_data.get('partNumber')
            presigned_url = s3.generate_presigned_url(
                'upload_part',
                Params={
                    'Bucket': settings.BUCKET_NAME,
                    'Key': key,
                    'UploadId': upload_id,
                    'PartNumber': part_number
                },
                ExpiresIn=3600
            )
            return Response({'url': presigned_url}, status=status.HTTP_200_OK)
        except NoCredentialsError:
            return Response({"message": "Credentials not available"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteMultipartUploadView(generics.GenericAPIView):

    def get_serializer_class(self):
        return CompleteMultipartUploadSerializer

    def post(self, request):
        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            key = serializer.validated_data.get('key')
            upload_id = serializer.validated_data.get('uploadId')
            parts = serializer.validated_data.get('parts')
            response = s3.complete_multipart_upload(
                Bucket=settings.BUCKET_NAME,
                Key=key,
                UploadId=upload_id,
                MultipartUpload={'Parts': parts}
            )
            return Response({'success': True, 'response': response}, status=status.HTTP_200_OK)
        except NoCredentialsError:
            return Response({"message": "Credentials not available"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AWSDownloadS3(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # AWS credentials
        self.AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID
        self.AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY

        # Bucket name
        self.BUCKET_NAME = settings.BUCKET_NAME



    # Download files from S3 bucket
    def download_from_s3(self, company, folder_name, files):
        s3 = boto3.client('s3', aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY)
        try:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'a') as zip_file:
                for file_name in [files]:
                    response = s3.get_object(Bucket=self.BUCKET_NAME, Key=f"{company}/{folder_name}/{file_name}")
                    file_content = response['Body'].read()
                    zip_file.writestr(file_name, file_content)
            zip_buffer.seek(0)
            return zip_buffer.getvalue()
        except NoCredentialsError:
            print("Credentials not available")
            return None

    def get(self, request, format=None):
        company = request.query_params.get('company', None)
        folder_name = request.query_params.get('folder_name', None)
        files = request.query_params.get('file_name', None)
        # files = request.query_params.getlist('files')

        if not folder_name or not files:
            return Response({"message": "Folder name and list of files are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        zip_content = self.download_from_s3(company, folder_name, files)

        if not zip_content:
            return Response({"message": "Failed to download files"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = HttpResponse(zip_content, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{folder_name}.zip"'
        return response


class OfferResponseAPIView(APIView):

    def get_queryset(self, id):
        case_data = {
            'offer_response': [],
            'offer': []
        }
        if id:
            offer_response = subro_offer_responder.objects.get(id=int(id))
            offer = subro_offer_request.objects.get(id=offer_response.subro_offer_request_id.id)

            case_serializer = SubroOfferSerializer(offer)
            offer_serializer = SubroOfferSerializer(offer_response)
            case_data['offer_response'] = offer_serializer.data
            case_data['offer'] = case_serializer.data
        # Filter the queryset based on the user's ID
        return case_data

    def get(self, request):
        id = request.query_params.get('subroofferid', None)
        queryset = self.get_queryset(id)
        return Response(queryset)


class RespondingVinCompany(generics.ListAPIView):
    queryset = subro_resp_org_vehicle_vin.objects.all()
    serializer_class = SubroRespVinSerializer


class CreateOfferView(generics.CreateAPIView):

    def get_serializer_class(self):
        return SubroOfferSerializer

    def create(self, request):
        serializer = SubroOfferSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListSentOffersView(generics.ListAPIView):
    filter_backends = [DjangoFilterBackend, SortingFilterBackend]
    filterset_class = ListSentOffersFilter

    active_offer_statuses = [RequestOfferStatus.ZERO_TWO_KEYS,
                             RequestOfferStatus.ONE_TWO_KEYS,
                             RequestOfferStatus.SIGNED,
                             RequestOfferStatus.ARBITRATION,
                             RequestOfferStatus.AI]

    closed_offer_statuses = [RequestOfferStatus.AP1,
                             RequestOfferStatus.AP2,
                             RequestOfferStatus.AP3,
                             RequestOfferStatus.CANCELLED]

    order_fields_dict = {
        'responderCompanyName': 'responderCompany__company',
        'cycleTime': 'cycle_time',
        'offerVehicleVIN': 'offerVehicleVin_id__vin_id',
        'respondVehicleVIN': 'respondVehicleVin_id__vin_id',
        'initialAmount': 'offerAmount',
        'status': 'status',
    }

    def get_serializer_class(self):
        return ListOffersSerializer

    def get_sortable_fields(self):
        return ['submission_date', 'status']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.order_by('-modified_date')
        sort = request.GET.get("sort", "")
        order = request.GET.get("order", "asc")
        if self.order_fields_dict.get(sort, '') != '':
            order_field = self.order_fields_dict.get(sort, '')
            queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
        paginated_queryset = self.paginate_queryset(queryset)
        serializer = self.get_serializer(paginated_queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def get_queryset(self):
        try:
            user = subroUser.objects.get(user_id=self.request.user)
            subro_organization_user_instance = subro_organization_user.objects.get(user=user)
            organization = subro_organization.objects.get(id=subro_organization_user_instance.company_id)
            queryset = subro_offer_request.objects.select_related(
                'responderCompany',
                'requestor__company',
                'offerVehicleVin_id__vin_id',
                'respondVehicleVin_id__vin_id'
            ).prefetch_related(
                Prefetch(
                    'subro_offer_responder_set',
                    queryset=subro_offer_responder.objects.all(),
                ),
                Prefetch(
                    'signatures',
                )
            ).filter(
                requestor__company=organization
            ).filter(
                status__in=self.active_offer_statuses
                if not self.kwargs.get('history')
                else self.closed_offer_statuses
            ).annotate(
                signedByMe=Exists(
                    SubroOfferSignature.objects.filter(offer_request=OuterRef('id'), signed_by=subro_organization_user_instance)
                ),
            )

        except subroUser.DoesNotExist:
            raise NotFound("User does not exist")
        except subro_organization_user.DoesNotExist:
            raise NotFound("Organization user does not exist")
        except subro_organization.DoesNotExist:
            raise NotFound("Organization does not exist")
        except Exception as e:
            raise APIExceptions(str(e))

        return queryset


class ListReceivedOffersView(generics.ListAPIView):
    filter_backends = [DjangoFilterBackend, SortingFilterBackend]
    filterset_class = ListReceivedOffersFilter
    order_fields_dict = {
        'senderCompanyName': 'requestor__company__company',
        'cycleTime': 'cycle_time',
        'offerVehicleVIN': 'offerVehicleVin_id__vin_id',
        'respondVehicleVIN': 'respondVehicleVin_id__vin_id',
        'initialAmount': 'offerAmount',
        'status': 'status',
    }

    draft_offer_statuses = [RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS]
    active_offer_statuses = [RequestOfferStatus.ZERO_TWO_KEYS,
                             RequestOfferStatus.ONE_TWO_KEYS,
                             RequestOfferStatus.SIGNED,
                             RequestOfferStatus.ARBITRATION,
                             RequestOfferStatus.AI]

    closed_offer_statuses = [RequestOfferStatus.AP1,
                             RequestOfferStatus.AP2,
                             RequestOfferStatus.AP3,
                             RequestOfferStatus.CANCELLED]

    def get_serializer_class(self):
        return ListOffersReceivedSerializer

    def get_sortable_fields(self):
        return ['submission_date', 'status']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.order_by('-modified_date')

        sort = request.GET.get("sort", "")
        order = request.GET.get("order", "asc")
        if self.order_fields_dict.get(sort, '') != '':
            order_field = self.order_fields_dict.get(sort, '')
            queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)

        paginated_queryset = self.paginate_queryset(queryset)
        serializer = self.get_serializer(paginated_queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def get_queryset(self):
        try:
            user = subroUser.objects.get(user_id=self.request.user)
            subro_organization_user_instance = subro_organization_user.objects.get(user=user)
            organization = subro_organization.objects.get(id=subro_organization_user_instance.company_id)
            queryset = (subro_offer_request.objects.select_related(
                'responderCompany',
                'requestor__company',
                'offerVehicleVin_id__vin_id',
                'respondVehicleVin_id__vin_id'
            ).prefetch_related(
                Prefetch(
                    'subro_offer_responder_set',
                    queryset=subro_offer_responder.objects.all(),
                ),
            ).filter(
                responderCompany=organization
            ).filter(
                status__in=self.active_offer_statuses
                if not self.kwargs.get('history')
                else self.closed_offer_statuses
            ))

        except subroUser.DoesNotExist:
            raise NotFound("User does not exist")
        except subro_organization_user.DoesNotExist:
            raise NotFound("Organization user does not exist")
        except subro_organization.DoesNotExist:
            raise NotFound("Organization does not exist")
        except Exception as e:
            raise APIExceptions(str(e))

        return queryset


class RetrieveOfferView(generics.RetrieveAPIView):

    def get_serializer_class(self):
        return OfferRetrieveSerializer

    def get_queryset(self):
        business_user = subro_organization_user.objects.get(user__user_id=self.request.user)
        return (subro_offer_request.objects.filter(id=self.kwargs['pk']).prefetch_related(
            Prefetch('signatures'),
            Prefetch(
                'subro_offer_responder_set',
                queryset=subro_offer_responder.objects.all(),
            ),
        ).annotate(
            signedByMe=Exists(
                SubroOfferSignature.objects.filter(offer_request=OuterRef('id'), signed_by=business_user)
            ),
        ))

    def get(self, request, *args, **kwargs):
        try:
            offer_instance = self.get_queryset().first()
            if not offer_instance:
                return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(offer_instance)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OfferAttachmentApiView(generics.ListAPIView):
    queryset = subro_offer_request_file.objects.all()
    serializer_class = OfferAttachmentSerializer
    pagination_class = None

    @swagger_auto_schema(
        responses={
            200: openapi.Response(
                description="Files retrieved successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, description='Response message'),
                        'data': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'uuid': openapi.Schema(type=openapi.TYPE_STRING, format='uuid'),
                                    'offerId': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'fileType': openapi.Schema(type=openapi.TYPE_STRING),
                                    'fileName': openapi.Schema(type=openapi.TYPE_STRING),
                                    'key': openapi.Schema(type=openapi.TYPE_STRING),
                                }
                            )
                        )
                    }
                )
            ),
            404: openapi.Response(description="Offer not found", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING)
                }
            ))
        }
    )
    def get(self, request, *args, **kwargs):
        offer_id = kwargs.get('offer_id')
        offer_instance = subro_offer_request.objects.filter(id=offer_id)
        if not offer_instance:
            return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)
        offer_files = subro_offer_request_file.objects.filter(offer_id=offer_instance.first()).order_by(
            '-uploaded_at'
        )
        serializer = OfferAttachmentSerializer(offer_files, many=True)
        return Response({'message': 'Files retrieved successfully', 'data': serializer.data})


class OfferAttachmentCreateApiView(generics.CreateAPIView):
    queryset = subro_offer_request_file.objects.all()

    def get_serializer_class(self):
        return OfferAttachmentSerializer

    def post(self, request, *args, **kwargs):
        organization_user = subro_organization_user.objects.get(user__user_id=request.user)

        if not organization_user:
            return Response({'error': 'Organization user not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data, context={'user_organization': organization_user.company})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'File uploaded successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OfferAttachmentDeleteApiView(generics.DestroyAPIView):
    queryset = subro_offer_request_file.objects.all()
    serializer_class = OfferAttachmentSerializer

    def delete(self, request, *args, **kwargs):
        file_id = kwargs.get('file_uuid')
        offer_file = subro_offer_request_file.objects.filter(uuid=file_id).first()

        if not offer_file:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        user_organization = subro_organization_user.objects.get(user__user_id=request.user)

        if not user_organization:
            return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (offer_file.uploaded_by_organization == user_organization.company):
            return Response({'error': 'You are not authorized to delete this file'}, status=status.HTTP_403_FORBIDDEN)

        offer_file.delete()
        return Response({'message': 'File deleted successfully'}, status=status.HTTP_200_OK)


class GetOfferCountView(generics.ListAPIView):
    permission_classes = [RootUserPermission | OrgUserPermission]

    def get_pending_sent_offers(self, org):
        queryset = subro_offer_request.objects.filter(requestor__company=org)
        queryset = queryset.exclude(
            Q(status__in=[RequestOfferStatus.AP1, RequestOfferStatus.AP2, RequestOfferStatus.AP3]) |
            Q(status=RequestOfferStatus.CANCELLED)
        )
        return queryset.count()

    def get_pending_received_offers(self, org):
        queryset = subro_offer_request.objects.filter(responderCompany=org)
        queryset = queryset.filter(
            Q(status__in=[RequestOfferStatus.SIGNED])
        )
        return queryset.count()

    def get_signed_sent_offers(self, org):
        queryset = subro_offer_request.objects.filter(requestor__company=org)
        queryset = queryset.filter(
            Q(status__in=[RequestOfferStatus.SIGNED])
        )
        return queryset.count()

    def get_draft_sent_offers(self, org):
        queryset = subro_offer_request.objects.filter(requestor__company=org)
        queryset = queryset.filter(
            Q(status__in=[RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS])
        )
        return queryset.count()

    def get_signed_received_offer_responses(self, org):
        queryset = subro_offer_responder.objects.filter(offer_sent_by__company=org)
        queryset = queryset.filter(
            Q(status__in=[ResponderOfferStatus.SIGNED])
        )
        return queryset.count()

    def get_draft_received_offer_responses(self, org):
        queryset = subro_offer_responder.objects.filter(offer_sent_by__company=org)
        queryset = queryset.filter(
            Q(status__in=[ResponderOfferStatus.ZERO_TWO_KEYS, ResponderOfferStatus.ONE_TWO_KEYS])
        )
        return queryset.count()


    def get(self, request, *args, **kwargs):
        try:
            if request.user.groups.filter(name=UserPermissions.ORG_USER.value).exists():
                user = subro_organization_user.objects.filter(user__user_id=self.request.user).first()
                if not user:
                    raise APIExceptions("You are not a part of any organization. Contact Administrator.",
                                        status_code=status.HTTP_400_BAD_REQUEST)
                org = user.company

            elif request.user.groups.filter(name=UserPermissions.ORG_ROOT.value).exists():
                org = subro_organization.objects.filter(root_user=self.request.user).first()

            else:
                raise APIExceptions("You are not a ORG_ROOT or ORG_USER of any organization. Contact Administrator.",
                                    status_code=status.HTTP_400_BAD_REQUEST)
            return Response({
                "status": "success",
                "message": "",
                "data": {
                    "pendingSentOffers": self.get_pending_sent_offers(org),
                    "pendingReceivedOffers": self.get_pending_received_offers(org),
                    "signedSentOffers": self.get_signed_sent_offers(org),
                    "draftSentOffers": self.get_draft_sent_offers(org),
                    "signedReceivedOfferResponses": self.get_signed_received_offer_responses(org),
                    "draftReceivedOfferResponses": self.get_draft_received_offer_responses(org),
                }}, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class OfferResponseCreateView(generics.CreateAPIView):
    serializer_class = CreateOfferResponseSerializer
    queryset = subro_offer_responder.objects.all()

    def create(self, request, *args, **kwargs):
        pk = kwargs.get('offerId')
        if not subro_offer_request.objects.filter(id=pk).exists():
            return Response({"error": "Offer not found"}, status=status.HTTP_404_NOT_FOUND)
        subro_user = subroUser.objects.get(user_id=request.user)
        subro_org_user = subro_organization_user.objects.get(user=subro_user)
        responders = subro_offer_responder.objects.filter(subro_offer_request_id=int(pk))
        if responders.count() >= 3:
            return Response({"error": "Offer can only have 3 responders"}, status=status.HTTP_400_BAD_REQUEST)
        if not subro_org_user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        responder_company_wallet = subro_org_wallet.objects.filter(
            subro_organization_id=subro_org_user.company_id
        )
        if not responder_company_wallet.exists():
            return Response({"error": "Wallet not found"}, status=status.HTTP_404_NOT_FOUND)

        responder_wallet = responder_company_wallet.first()
        serializer = self.get_serializer(data=request.data, context={
            'offerId': pk, 'subro_org_user_id': subro_org_user.id, "responder_wallet": responder_wallet})
        if serializer.is_valid():
            if (responder_wallet.funds - serializer.validated_data['responseAmount']) < 0:
                return Response({"error": "Your organization's wallet balance is insufficient to cover the proposed offer amount. Please contact your organization administrator for assistance"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response({'message': 'Offer response created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@receiver(post_save, sender=subro_offer_responder)
def update_offer_status(sender, instance, created, **kwargs):
    if not instance.status == ResponderOfferStatus.SIGNED:
        return

    responders = subro_offer_responder.objects.filter(subro_offer_request_id=instance.subro_offer_request_id)
    subro_offer_req = subro_offer_request.objects.get(id=instance.subro_offer_request_id.id)
    for responder, stat in zip(responders, [RequestOfferStatus.AP1, RequestOfferStatus.AP2, RequestOfferStatus.AP3]):
        if responder.is_accepted:
            subro_offer_req.status = stat
            subro_offer_req.cycle_time = timezone.now() - subro_offer_req.submission_date
            subro_offer_req.save()

            company_wallet = subro_org_wallet.objects.filter(
                subro_organization_id=subro_offer_req.requestor.company_id
            )
            responder_company_wallet = subro_org_wallet.objects.filter(
                subro_organization_id=responder.offer_sent_by.company_id
            )
            if not company_wallet.exists() and not responder_company_wallet.exists():
                return
            subro_offer_transaction_status = subro_org_wallet_transaction.create_transaction(
                responder_wallet=responder_company_wallet.first(),
                issuer_wallet=company_wallet.first(),
                amount=responder.offer_amount,
                response_status=subro_offer_req.status
            )

            return subro_offer_transaction_status
    if responders.count() == 3:
        subro_offer_req.status = RequestOfferStatus.ARBITRATION
        subro_offer_req.cycle_time = timezone.now() - subro_offer_req.submission_date
        subro_offer_req.save()


class ResponseSignView(generics.CreateAPIView):

    def post(self, request, *args, **kwargs):
        offer_responder = subro_offer_responder.objects.get(id=kwargs.get('responseId'))

        if not offer_responder:
            return Response({'error': 'Offer responder not found'}, status=status.HTTP_404_NOT_FOUND)

        if offer_responder.status == RequestOfferStatus.SIGNED:
            return Response({'error': 'Offer respond already signed'}, status=status.HTTP_400_BAD_REQUEST)

        organization_user = subro_organization_user.objects.get(user__user_id=request.user)
        organization = organization_user.company
        if offer_responder.subro_offer_request_id.responderCompany != organization:
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        if not organization_user:
            return Response({'error': 'Organization user not found'}, status=status.HTTP_404_NOT_FOUND)

        key = SubroKey.objects.filter(assigned_user=organization_user).first()
        if not key:
            return Response({'error': 'Key not assigned to the user'}, status=status.HTTP_404_NOT_FOUND)

        responder_signature, created = SubroResponderSignature.objects.get_or_create(
            signed_by=organization_user,
            offer_responder=offer_responder
        )
        if not created:
            return Response({'error': 'Offer response already signed by user'}, status=status.HTTP_400_BAD_REQUEST)

        responder_signature.save()
        responder_signatures_count = SubroResponderSignature.objects.filter(offer_responder=offer_responder).count()

        if responder_signatures_count == 2:
            offer_responder.status = RequestOfferStatus.SIGNED
        else:
            offer_responder.status = RequestOfferStatus.ONE_TWO_KEYS

        offer_responder.save()
        return Response({'message': 'Offer response signed successfully'}, status=status.HTTP_201_CREATED)




class OfferSignView(generics.CreateAPIView):

    def post(self, request, *args, **kwargs):
        offer_request = subro_offer_request.objects.get(id=kwargs.get('offerId'))
        if not offer_request:
            return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)

        if offer_request.status not in [RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS]:
            return Response({'error': 'Offer already signed by all users'}, status=status.HTTP_400_BAD_REQUEST)

        organization_user = subro_organization_user.objects.get(user__user_id=request.user)
        organization = organization_user.company
        if offer_request.requestor.company != organization:
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        if not organization_user:
            return Response({'error': 'Organization user not found'}, status=status.HTTP_404_NOT_FOUND)

        key = SubroKey.objects.filter(assigned_user=organization_user).first()
        if not key:
            return Response({'error': 'Key not assigned to the user'}, status=status.HTTP_404_NOT_FOUND)

        offer_signature, created = SubroOfferSignature.objects.get_or_create(
            signed_by=organization_user,
            offer_request=offer_request
        )
        if not created:
            return Response({'error': 'Offer already signed by user'}, status=status.HTTP_400_BAD_REQUEST)

        offer_signature.save()
        offer_signatures_count = SubroOfferSignature.objects.filter(offer_request=offer_request).count()

        if offer_signatures_count == 2:
            offer_request.status = RequestOfferStatus.SIGNED
        else:
            offer_request.status = RequestOfferStatus.ONE_TWO_KEYS

        offer_request.save()
        return Response({'message': 'Offer signed successfully'}, status=status.HTTP_201_CREATED)