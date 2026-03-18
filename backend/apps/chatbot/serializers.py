from rest_framework import serializers

class ChatbotRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=500)


class ChatbotResponseSerializer(serializers.Serializer):
    intent = serializers.CharField()
    confidence = serializers.FloatField()
    response = serializers.CharField()
