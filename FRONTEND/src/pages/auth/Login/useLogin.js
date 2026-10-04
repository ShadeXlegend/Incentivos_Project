import { yupResolver } from "@hookform/resolvers/yup";
import { gsUrlApi } from "@src/config/ConfigServer";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import * as yup from "yup";
import { useAuthContext } from "../../../states";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {isAuthenticated, saveSession} = useAuthContext();

  let gObjEvent = null;
  let timetemps = 30;

  const loginFormSchema = yup.object({
    email: yup.string("Por favor ingresa un correo válido").required("Por favor ingresa un correo"),
    password: yup.string().required("Por favor ingresa una contraseña"),
    rememberMe: yup.boolean().oneOf([true], "Checkbox must be checked").optional()
  });

  const {control, handleSubmit} = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const redirectUrl = useMemo(() => (location.state?.from.pathname, "/inicio"), [location.state]);


  const login = handleSubmit(async values => {
  setLoading(true);

  try {
    const res = await fetch(gsUrlApi + "/login", {
      method: "POST",
      body: JSON.stringify({
        Login: values.email,
        Clave: values.password
      }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json"
      }
    });

    const data = await res.json();

    if (data.failure_message) {
      Swal.fire({
        title: "Error",
        text: data.failure_message,
        icon: "warning"
      });
      setLoading(false);
      return;
    }

    if (data.usuario && data.token) {
      // Guardar token
      localStorage.setItem("token", data.token);
localStorage.setItem("Usuario", JSON.stringify(data.usuario));


      saveSession({
        token: data.token,
        usuario: data.usuario
      });

      // Espera unos milisegundos para que se actualicen las rutas permitidas
      setTimeout(() => {
        window.location.href = redirectUrl; 
      }, 100);

    } else {
      Swal.fire({
        title: "Usuario no encontrado",
        text: "El usuario ingresado no existe o los datos son incorrectos.",
        icon: "warning"
      });
    }
  } catch (err) {
    console.error("Error en login:", err);
    Swal.fire({
      title: "Error",
      text: "Ocurrió un error al intentar iniciar sesión.",
      icon: "error"
    });
  } finally {
    setLoading(false);
  }
});

  return {
    loading,
    login,
    redirectUrl,
    isAuthenticated,
    control
  };
}