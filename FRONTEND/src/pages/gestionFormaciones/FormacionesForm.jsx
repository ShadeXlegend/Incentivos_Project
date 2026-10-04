import React, { useState } from "react";
import { Box, Paper, TextField, MenuItem, Button } from "@mui/material";
import { Cancel, DoneAll } from "@mui/icons-material";
import { PageBreadcrumb } from "components";
import Swal from "sweetalert2";

const FormacionesForm = ({
  data = {},
  onCancel,
  cerrarFormulario,
  crearFormacion,
  actualizarFormacion,
  modoEdicion,
}) => {
  const [formData, setFormData] = useState({
    nombre_formacion: data.nombre_formacion || "",
    periodo: data.periodo || "",
    linea_cualificacion: data.linea_cualificacion || "",
    numero_horas: data.numero_horas || "",
    fecha_inicio: data.fecha_inicio || "",
    fecha_terminacion: data.fecha_terminacion || "",
    observaciones: data.observaciones || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      nombre_formacion: formData.nombre_formacion,
      periodo: formData.periodo,
      linea_cualificacion: formData.linea_cualificacion,
      numero_horas: parseInt(formData.numero_horas, 10),
      fecha_inicio: formData.fecha_inicio,
      fecha_terminacion: formData.fecha_terminacion,
      observaciones: formData.observaciones,
    };

    let result;
    if (data.id_formacion) {
      // Actualizar
      result = await actualizarFormacion(data.id_formacion, datos);
    } else {
      // Crear
      result = await crearFormacion(datos);
    }

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: data.id_formacion ? "Formación actualizada" : "Formación creada",
        text:
          result.mensaje ||
          (data.id_formacion ? "Actualización exitosa." : "Registro exitoso."),
        confirmButtonColor: "#3085d6",
      });
      if (cerrarFormulario) cerrarFormulario();
    } else {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: result.mensaje || "Ocurrió un error.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "40vh" }}>
      <Box sx={{ flex: 1 }}>
        <PageBreadcrumb
          title={modoEdicion ? "Actualizar Formación" : "Registrar Formación"}
          subName="App"
        />

        <Paper elevation={3} sx={{ borderRadius: 4, p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
              }}
            >
              <TextField
                fullWidth
                label="Nombre de la formación"
                name="nombre_formacion"
                value={formData.nombre_formacion}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Período"
                name="periodo"
                value={formData.periodo}
                onChange={handleChange}
              />
              <TextField
                select
                fullWidth
                label="Línea de cualificación"
                name="linea_cualificacion"
                value={formData.linea_cualificacion}
                onChange={handleChange}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="Docencia">Docencia</MenuItem>
                <MenuItem value="Investigación">Investigación</MenuItem>
                <MenuItem value="TIC">TIC</MenuItem>
                <MenuItem value="Administrativa">Administrativa</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Número de horas"
                name="numero_horas"
                type="number"
                value={formData.numero_horas}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Fecha de inicio"
                name="fecha_inicio"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_inicio}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Fecha de terminación"
                name="fecha_terminacion"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_terminacion}
                onChange={handleChange}
              />
            </Box>

            {/* Observaciones en toda la fila */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                name="observaciones"
                placeholder="Opcional..."
                value={formData.observaciones}
                onChange={handleChange}
              />
            </Box>

            {/* Botones */}
            <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
              <Button
                variant="contained"
                onClick={onCancel}
                color="error"
                startIcon={<Cancel />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={<DoneAll />}
              >
                Guardar
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default FormacionesForm;
