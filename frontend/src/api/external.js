const API_URL = import.meta.env.VITE_BASE_API_URL;

// API de terceros (gratis y sin API key): clima actual de Open-Meteo
export async function getWeatherApi(latitude, longitude) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo obtener el clima");
  return await response.json();
}

// Endpoint propio de Django que consume el servicio SOAP con zeep
export async function getSoapCountryApi(token, code) {
  const response = await fetch(`${API_URL}/api/v1/soap/country/?code=${code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.detail || "Error al consultar el servicio SOAP");
  return result;
}
