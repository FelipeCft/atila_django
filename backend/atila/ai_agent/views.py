from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import AIService

class ChatAPIView(APIView):
    authentication_classes = [] # Deshabilitar CSRF checks para endpoint público
    permission_classes = [] # Permitir acceso público para dudas generales

    def post(self, request):
        session_id = request.data.get('session_id')
        user_message = request.data.get('message')

        if not session_id or not user_message:
            return Response(
                {"error": "session_id and message are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        ai_service = AIService()
        response_text = ai_service.get_response(session_id, user_message)

        return Response({"response": response_text})
