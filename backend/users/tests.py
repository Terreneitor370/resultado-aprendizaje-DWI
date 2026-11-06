from rest_framework.test import APITestCase

from users.models import User


class UserSecurityTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='admin', email='admin@tienda.com', password='AdminPass123')
        self.client.force_authenticate(self.admin)

    def test_password_nunca_aparece_en_respuestas(self):
        r = self.client.post('/api/v1/users/', {
            'username': 'ana', 'email': 'ana@tienda.com',
            'password': 'Secreta12345', 'telefono': '4491234567'})
        self.assertEqual(r.status_code, 201)
        self.assertNotIn('password', r.data)
        self.assertEqual(r.data['telefono'], '4491234567')
        self.assertNotIn('password', self.client.get('/api/v1/users/').data['results'][0]
                         if 'results' in self.client.get('/api/v1/users/').data
                         else self.client.get('/api/v1/users/').data[0])
        self.assertNotIn('password', self.client.get('/api/v1/auth/me/').data)

    def test_editar_sin_password_no_cambia_ninguna_contrasena(self):
        user = User.objects.create_user(
            username='luis', email='luis@tienda.com', password='Original12345')
        hash_usuario, hash_admin = user.password, self.admin.password
        r = self.client.patch(f'/api/v1/users/{user.id}/', {'first_name': 'Luis'})
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.admin.refresh_from_db()
        self.assertEqual(user.password, hash_usuario)
        self.assertEqual(self.admin.password, hash_admin)
        self.assertTrue(user.check_password('Original12345'))

    def test_editar_con_password_si_la_cambia(self):
        user = User.objects.create_user(
            username='eva', email='eva@tienda.com', password='Original12345')
        self.client.patch(f'/api/v1/users/{user.id}/', {'password': 'Nueva12345'})
        user.refresh_from_db()
        self.assertTrue(user.check_password('Nueva12345'))

    def test_put_sin_password_tampoco_la_cambia(self):
        user = User.objects.create_user(
            username='raul', email='raul@tienda.com', password='Original12345')
        r = self.client.put(f'/api/v1/users/{user.id}/', {
            'username': 'raul', 'email': 'raul@tienda.com'})
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password('Original12345'))

    def test_login_jwt_y_datos_personales(self):
        User.objects.create_user(
            username='sofi', email='sofi@tienda.com', password='Original12345',
            telefono='4440001111')
        self.client.force_authenticate(None)
        r = self.client.post('/api/v1/auth/token/', {
            'email': 'sofi@tienda.com', 'password': 'Original12345'})
        self.assertEqual(r.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + r.data['access'])
        me = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me.data['email'], 'sofi@tienda.com')
        self.assertEqual(me.data['telefono'], '4440001111')
        self.assertNotIn('password', me.data)


class RegisterTests(APITestCase):
    def test_registro_publico_crea_usuario_con_hash_y_sin_privilegios(self):
        r = self.client.post('/api/v1/auth/register/', {
            'username': 'nuevo', 'email': 'nuevo@tienda.com', 'password': 'Segura12345',
            'is_staff': True, 'is_superuser': True})
        self.assertEqual(r.status_code, 201)
        self.assertNotIn('password', r.data)
        u = User.objects.get(email='nuevo@tienda.com')
        self.assertTrue(u.check_password('Segura12345'))
        self.assertFalse(u.is_staff)
        self.assertFalse(u.is_superuser)

    def test_registro_rechaza_password_debil_y_email_repetido(self):
        r = self.client.post('/api/v1/auth/register/', {
            'username': 'x', 'email': 'x@tienda.com', 'password': '123'})
        self.assertEqual(r.status_code, 400)
        User.objects.create_user(username='a', email='a@tienda.com', password='Segura12345')
        r = self.client.post('/api/v1/auth/register/', {
            'username': 'b', 'email': 'a@tienda.com', 'password': 'Segura12345'})
        self.assertEqual(r.status_code, 400)


class SoapTests(APITestCase):
    def test_soap_requiere_token(self):
        self.assertEqual(self.client.get('/api/v1/soap/country/').status_code, 401)

    def test_soap_devuelve_datos_del_servicio(self):
        from types import SimpleNamespace as NS
        from unittest import mock
        info = NS(sISOCode='MX', sName='Mexico', sCapitalCity='Mexico City', sContinentCode='AM',
                  sPhoneCode='52', sCurrencyISOCode='MXN', sCountryFlag='http://x/mx.jpg',
                  Languages=NS(tLanguage=[NS(sName='Spanish')]))
        client = mock.Mock()
        client.service.FullCountryInfo.return_value = info
        self.client.force_authenticate(User.objects.create_user(
            username='u', email='u@tienda.com', password='Segura12345'))
        with mock.patch('users.soap_views.get_client', return_value=client):
            r = self.client.get('/api/v1/soap/country/?code=mx')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['pais'], 'Mexico')
        client.service.FullCountryInfo.assert_called_once_with(sCountryISOCode='MX')
        self.assertEqual(self.client.get('/api/v1/soap/country/?code=123').status_code, 400)
