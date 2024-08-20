from rest_framework import serializers
from subro_messages.models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp']

    def to_representation(self, instance):
        """
        Custom method to modify the representation of the message.
        In this case, we replace sender and receiver with their usernames.
        """
        representation = super().to_representation(instance)
        representation['sender'] = instance.sender.username
        representation['receiver'] = instance.receiver.username
        return representation