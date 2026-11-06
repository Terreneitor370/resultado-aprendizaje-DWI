import React from "react";
import { Button } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";
import { WeatherWidget } from "../../components/WeatherWidget";
import { CountryWidget } from "../../components/CountryWidget";

export function Dashboard() {
  const { logout, auth } = useAuth();
  const user = auth.me;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <div className="dashboard">
      <div className="dashboard__bar">
        <h1>Dashboard</h1>
        <Button type="button" content="Cerrar Sesión" onClick={logout} />
      </div>
      <div className="dashboard__content">
        <h2>Bienvenido {fullName || user.username}</h2>
        <p>
          Correo: {user.email}
          {user.telefono && ` · Teléfono: ${user.telefono}`}
        </p>
        <div className="dashboard__grid">
          <WeatherWidget />
          <CountryWidget code="MX" />
        </div>
      </div>
    </div>
  );
}
