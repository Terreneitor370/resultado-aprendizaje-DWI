from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users import views
from users.soap_views import SoapCountryView

router = routers.DefaultRouter()
router.register(r'users', views.UserApiViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', views.UserView.as_view()),
    path('auth/register/', views.RegisterUserView.as_view(), name='register'),
    path('soap/country/', SoapCountryView.as_view(), name='soap_country'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
