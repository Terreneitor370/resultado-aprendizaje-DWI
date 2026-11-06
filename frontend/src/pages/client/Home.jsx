import React from "react";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";

export function Home() {
  const { auth } = useAuth();
  return (
    <div className="home">
      <h1>Tienda Online</h1>
      <p>Frontend en React conectado a la API de Django con JWT.</p>
      <div>
        {auth ? (
          <Button as={Link} to="/dashboard" primary content="Ir al Dashboard" />
        ) : (
          <>
            <Button as={Link} to="/login" primary content="Iniciar sesion" />
            <Button as={Link} to="/register" content="Registrarse" />
          </>
        )}
      </div>
    </div>
  );
}
