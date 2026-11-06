import React, { useEffect, useState } from "react";
import { Loader } from "semantic-ui-react";
import { getWeatherApi } from "../api/external";

// Aguascalientes, Ags.
const CITY = { name: "Aguascalientes, México", lat: 21.88, lon: -102.29 };

const WEATHER_CODES = {
  0: "Despejado", 1: "Mayormente despejado", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Niebla", 48: "Niebla con escarcha", 51: "Llovizna ligera", 53: "Llovizna",
  55: "Llovizna intensa", 61: "Lluvia ligera", 63: "Lluvia", 65: "Lluvia fuerte",
  71: "Nieve ligera", 73: "Nieve", 75: "Nieve fuerte", 80: "Chubascos ligeros",
  81: "Chubascos", 82: "Chubascos fuertes", 95: "Tormenta", 96: "Tormenta con granizo",
  99: "Tormenta con granizo fuerte",
};

export function WeatherWidget() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWeatherApi(CITY.lat, CITY.lon)
      .then((result) => setData(result.current))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="widget">
      <h3>Clima actual · {CITY.name}</h3>
      {error && <p>{error}</p>}
      {!data && !error && <Loader active inline="centered" />}
      {data && (
        <>
          <div className="widget__big">{data.temperature_2m} °C</div>
          <p>{WEATHER_CODES[data.weather_code] ?? "Sin descripción"}</p>
          <p>
            Humedad: {data.relative_humidity_2m}% · Viento: {data.wind_speed_10m} km/h
          </p>
          <div className="widget__source">Fuente: API de terceros Open-Meteo (fetch)</div>
        </>
      )}
    </div>
  );
}
