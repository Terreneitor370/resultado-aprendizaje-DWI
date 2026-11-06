const API_URL = import.meta.env.VITE_BASE_API_URL;

export async function loginApi(formData) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/v1/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }
  if (response.status !== 200) {
    throw new Error("Usuario o contraseña incorrecta");
  }
  return await response.json();
}

export async function registerApi(formData) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/v1/auth/register/`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }
  const result = await response.json().catch(() => ({}));
  if (response.status !== 201) {
    // DRF responde {campo: ["mensaje", ...]}: se muestra el primer mensaje
    const first = Object.values(result).flat()[0];
    throw new Error(first || "No se puede crear el usuario");
  }
  return result;
}

export async function getMeApi(token) {
  const response = await fetch(`${API_URL}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Token invalido o expirado");
  return await response.json();
}
