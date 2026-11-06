import React, { useEffect, useState } from "react";
import { Loader } from "semantic-ui-react";
import { getSoapCountryApi } from "../api/external";
import { useAuth } from "../hooks/useAuth";

// Muestra la respuesta del endpoint de Django que consume un servicio SOAP con zeep
export function CountryWidget({ code = "MX" }) {
  const { auth } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSoapCountryApi(auth.token, code)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [auth.token, code]);

  return (
    <div className="widget">
      <h3>País (vía SOAP) · {code}</h3>
      {error && <p>{error}</p>}
      {!data && !error && <Loader active inline="centered" />}
      {data && (
        <>
          <div className="widget__big">{data.pais}</div>
          <p>Capital: {data.capital} · Moneda: {data.moneda}</p>
          <p>Tel. internacional: +{data.telefono_internacional} · Idiomas: {data.idiomas.join(", ")}</p>
          <div className="widget__source">Fuente: {data.fuente}</div>
        </>
      )}
    </div>
  );
}
