import { Grid, Box, Container, Typography } from "@mui/material";
import logo from "@src/assets/images/UnicartagenaLogo.png";
import InfoAccesoDocente from "@src/components/InfoAccesoDocente";

const Inicio = () => {
  return (
    <Container maxWidth="lg" sx={{ pt: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        sx={{ mb: 3, fontWeight: 600 }}
      >
        ¡Bienvenido!
      </Typography>

      {/* Componente informativo para docentes */}
      <InfoAccesoDocente />
      
      {/* Logo principal */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "60vh", padding: "1rem" }}
      >
        <Grid item xs={12} sm={6} md={9} lg={6} textAlign="center">
          <img
            src={logo}
            alt="Logo Universidad de Cartagena"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Inicio;
