import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { registerApi } from "../../api/user";

export function Register() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    onSubmit: async (values) => {
      try {
        // confirmPassword solo se valida en el frontend, no se envia a la API
        const formValues = { ...values };
        delete formValues.confirmPassword;
        await registerApi(formValues);
        toast.success("Usuario registrado, ya puedes iniciar sesión");
        navigate("/login");
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  const field = (name, placeholder, type = "text") => (
    <Form.Input
      name={name}
      type={type}
      placeholder={placeholder}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && formik.errors[name]}
    />
  );

  return (
    <div className="login-admin">
      <div className="login-admin__content">
        <h1>Registro</h1>
        <Form onSubmit={formik.handleSubmit}>
          {field("username", "Nombre de usuario")}
          {field("email", "Correo electrónico")}
          {field("telefono", "Teléfono (10 dígitos, opcional)")}
          {field("password", "Contraseña", "password")}
          {field("confirmPassword", "Confirmar contraseña", "password")}
          <Button type="submit" content="Crear cuenta" primary fluid />
        </Form>
        <div className="login-links">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}

function initialValues() {
  return { username: "", email: "", telefono: "", password: "", confirmPassword: "" };
}

function validationSchema() {
  return Yup.object({
    username: Yup.string().required("El usuario es obligatorio"),
    email: Yup.string()
      .email("Correo electrónico no válido")
      .required("El correo electrónico es obligatorio"),
    telefono: Yup.string().matches(/^(\d{10})?$/, "Debe tener 10 dígitos"),
    password: Yup.string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .required("La contraseña es obligatoria"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
      .required("Confirma tu contraseña"),
  });
}
