from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from requests import Session
from zeep import Client
from zeep.exceptions import Fault, TransportError
from zeep.transports import Transport

WSDL = 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL'

_client = None


def get_client():
    """Crea el cliente SOAP una sola vez (descargar el WSDL es lento)."""
    global _client
    if _client is None:
        _client = Client(WSDL, transport=Transport(session=Session(), timeout=15, operation_timeout=15))
    return _client


class SoapCountryView(APIView):
    """Consume el servicio SOAP publico CountryInfoService con zeep."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[openapi.Parameter(
            'code', openapi.IN_QUERY, description='Codigo ISO de 2 letras (MX, US, ES...)',
            type=openapi.TYPE_STRING, default='MX')],
        responses={200: 'Datos del pais obtenidos por SOAP', 400: 'Codigo invalido',
                   502: 'El servicio SOAP no respondio'},
    )
    def get(self, request):
        code = request.query_params.get('code', 'MX').strip().upper()
        if len(code) != 2 or not code.isalpha():
            return Response({'detail': 'code debe ser un codigo ISO de 2 letras.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            info = get_client().service.FullCountryInfo(sCountryISOCode=code)
        except (Fault, TransportError, OSError) as exc:
            return Response({'detail': f'Error al consumir el servicio SOAP: {exc}'},
                            status=status.HTTP_502_BAD_GATEWAY)
        if not info or not info.sName or info.sName.lower().startswith('country not found'):
            return Response({'detail': 'Pais no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'fuente': 'SOAP - CountryInfoService (zeep)',
            'codigo': info.sISOCode,
            'pais': info.sName,
            'capital': info.sCapitalCity,
            'continente': info.sContinentCode,
            'telefono_internacional': info.sPhoneCode,
            'moneda': info.sCurrencyISOCode,
            'bandera': info.sCountryFlag,
            'idiomas': [lang.sName for lang in (info.Languages.tLanguage if info.Languages else [])],
        })
