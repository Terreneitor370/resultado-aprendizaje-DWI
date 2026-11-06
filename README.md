# Resultado de aprendizaje 2 y 3 – Tienda Online (Django + React)

Backend en **Django REST Framework + JWT** (práctica 4) y frontend en **React + Vite**, con consumo de una
**API de terceros** (Open-Meteo) y de un **servicio SOAP** (CountryInfoService) mediante `zeep`.

```
backend/    Django, DRF, SimpleJWT, drf-yasg (Swagger), zeep
frontend/   React 18, Vite, React Router v6, Semantic UI, Formik + Yup
```

## Requisitos
- Python 3.10+ (probado con 3.13)
- Node.js 18+ (probado con 22)

## Instalación y ejecución

### 1. Backend (http://localhost:8000)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate      Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser      # opcional, para el admin y la API de usuarios
python manage.py runserver
```
La base de datos es SQLite (`db.sqlite3`, ignorada por git), no requiere instalar MySQL.

### 2. Frontend (http://localhost:5173)
```bash
cd frontend
cp .env.example .env                  # Windows: copy .env.example .env
npm install
npm run dev
```
`.npmrc` incluye `legacy-peer-deps=true` porque `semantic-ui-react` aún declara peer dependencies de React ≤ 18.

### 3. Pruebas del backend
```bash
cd backend
python manage.py test users
```

## Funcionalidad

| Parte | Dónde |
|---|---|
| Rutas y layouts (React Router v6) | `frontend/src/routes`, `frontend/src/layouts` |
| Login con JWT → guarda token → redirige al Dashboard | `frontend/src/pages/common/Login.jsx` |
| AuthContext + hook `useAuth` (sesión persistente) | `frontend/src/context`, `frontend/src/hooks` |
| Registro de usuarios | `frontend/.../Register.jsx` y `POST /api/v1/auth/register/` |
| Dashboard protegido con el nombre del usuario | `frontend/src/pages/admin/Dashboard.jsx` |
| Widget de API de terceros (clima, Open-Meteo, con `fetch`) | `frontend/src/components/WeatherWidget.jsx` |
| Web service propio protegido | `GET /api/v1/auth/me/` |
| Consumo SOAP con `zeep` | `GET /api/v1/soap/country/?code=MX` (`backend/users/soap_views.py`) |

### Endpoints principales (Swagger en http://localhost:8000/swagger/)
- `POST /api/v1/auth/register/` – registro público
- `POST /api/v1/auth/token/` – login (devuelve `access` y `refresh`)
- `GET  /api/v1/auth/me/` – datos del usuario autenticado
- `GET  /api/v1/soap/country/?code=MX` – datos de un país obtenidos por SOAP (requiere token)
- `/api/v1/users/` – CRUD de usuarios (solo administradores)

## Notas de seguridad / correcciones al manual
- La contraseña es `write_only`: el hash nunca sale en la API.
- Al editar un usuario sin enviar contraseña no se modifica ninguna contraseña.
- El registro usa los validadores de contraseña de Django, hashea con `set_password` y **no** acepta
  `is_staff` / `is_superuser` desde el cliente.
- CORS limitado a `localhost:5173` (en vez de `CORS_ORIGIN_ALLOW_ALL`).
- El frontend elimina el token guardado si ya expiró (`ACCESS_TOKEN_LIFETIME` = 30 min).
- `Login.jsx` imprime el token en la consola solo como evidencia de la práctica; quitar `console.log` en producción.
