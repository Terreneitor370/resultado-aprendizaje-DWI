from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from users.models import User
from users.serializers import RegisterUserSerializer, UserSerializer


class UserApiViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('id')


class UserView(APIView):
    """Datos personales del usuario autenticado (token JWT)."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RegisterUserView(CreateAPIView):
    """Registro publico de nuevos usuarios (no requiere token)."""
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterUserSerializer
    queryset = User.objects.all()
