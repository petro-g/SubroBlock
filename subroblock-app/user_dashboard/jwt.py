from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


class HomeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {'message': 'Welcome to the JWT  Authentication page using React Js and Django!'}
        return Response(content)


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_205_RESET_CONTENT)


class RefreshTokenView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')

        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=400)

        try:
            refresh_token = RefreshToken(refresh_token)
            access_token = refresh_token.access_token
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=400)

        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh_token)
        }, status=status.HTTP_200_OK)