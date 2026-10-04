import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment
} from "@mui/material";
import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { PageMetaData } from "@src/components";
import useLogin from "./useLogin";
import AuthLayout from "../AuthLayout";
import PasswordInput from "@src/components/form/PasswordInput";

const BottomLink = () => (
  <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
    <Typography variant="body2" color={"text.secondary"}>
      ¿No tienes una cuenta?&nbsp;
      <Link to="/auth/register">
        <Typography variant="subtitle2" component="span">
          Regístrate
        </Typography>
      </Link>
    </Typography>
  </Box>
);

const Login = () => {
  const { loading, login, control } = useLogin();

  return (
    <>
      <PageMetaData title="Inicio de Sesión" />

      <AuthLayout authTitle="INICIO DE SESIÓN" >
        <form onSubmit={login}>
          {/* Campo de Usuario con icono */}
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Usuario"
                placeholder="Escribe tu usuario"
                fullWidth
                variant="outlined"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo de Contraseña con icono */}
          <PasswordInput
            name="password"
            control={control}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
              },
            }}
          />


          {/* Botón de Ingreso */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              size="large"
              sx={{
                backgroundColor: "#FACC45",
                color: "#000",
                fontWeight: "bold",
                borderRadius: "30px",
                px: 4,
                ":hover": {
                  backgroundColor: "#fbbf24",
                },
              }}
            >
              Ingresar
            </Button>
          </Box>
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
