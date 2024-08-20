from rest_framework import generics, status
from subro_messages.serializers import MessageSerializer
from subro_messages.models import Message

class UserListMessagesAPIView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer