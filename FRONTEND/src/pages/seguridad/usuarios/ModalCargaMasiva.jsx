import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from "@mui/material";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
const rolesDisponibles = ["Docente"];

const ModalCargaMasiva = ({ open, onClose, onDataParsed, insertarDocentesMasivo }) => {
  const [archivoNombre, setArchivoNombre] = useState("");
  const [datosExcel, setDatosExcel] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState("");

  const handleArchivoExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivoNombre(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const hojaNombre = workbook.SheetNames[0];
      const hoja = workbook.Sheets[hojaNombre];
      const datos = XLSX.utils.sheet_to_json(hoja);

      // Asignar el rol seleccionado a todos los registros
      const datosConRol = datos.map((item) => ({
        ...item,
        rol: rolSeleccionado,
      }));

      setDatosExcel(datosConRol);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubir = async () => {
    if (datosExcel.length > 0) {
      const datosConRol = datosExcel.map((usuario) => ({
        numero_identificacion: usuario.numero_identificacion,
        id_rol: 2 
      }));

      try {
        const response = await insertarDocentesMasivo(datosConRol);

        // Cerrar el modal y limpiar estados inmediatamente
        onClose();
        setArchivoNombre("");
        setRolSeleccionado("");
        setDatosExcel([]);

        // Mostrar resumen con SweetAlert
      if (response.success && response.resumen) {
        const { exitosos, yaExistentes, fallidos } = response.resumen;

        // Mostrar swal sin mostrar los errores directamente
        Swal.fire({
          title: "Carga finalizada",
          icon: exitosos.length > 0 ? "success" : "info",
          html: `
            <p><b>Nuevos usuarios creados:</b> ${exitosos.length}</p>
            <p><b>Usuarios ya existentes:</b> ${yaExistentes.length}</p>
            <p><b>Fallidos:</b> ${fallidos.length}</p>
            ${fallidos.length > 0 ? "<p><b>Haz clic en el botón para descargar errores.</b></p>" : ""}
          `,
          showCancelButton: fallidos.length > 0,
          cancelButtonText: "Descargar errores",
          confirmButtonText: "Cerrar"
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel && fallidos.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(fallidos);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Errores");
            XLSX.writeFile(workbook, "NumerosIdentificaciónNoEncontrados.xlsx");
          }
        });
      } else {
        Swal.fire("Error", response.error || "Error inesperado", "error");
      }
    } catch (error) {
      console.error("Error al insertar docentes:", error);
      onClose();
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: '60%', sm: 500, md: 600 }, // Responsive
          bgcolor: "background.paper", // se adapta a tema claro/oscuro
          color: "text.primary",
          p: 4,
          borderRadius: 2,
          boxShadow: 14,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Typography
          variant="h6"
          textAlign="center"
          mb={2}
          fontWeight="bold"
        >
          Carga masiva de usuarios
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Sube un archivo <b>.csv</b>  con los datos de los usuarios.
        </Typography>

        <TextField
          select
          label="Asignar rol a todos los usuarios a subir"
          fullWidth
          size="small"
          value={rolSeleccionado}
          onChange={(e) => setRolSeleccionado(e.target.value)}
          sx={{ mb: 2 }}
        >
          {rolesDisponibles.map((rol) => (
            <MenuItem key={rol} value={rol}>
              {rol}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mb: 2 }}
          disabled={!rolSeleccionado}
        >
          Elegir archivo
          <input
            hidden
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleArchivoExcel}
          />
        </Button>

        <Typography variant="body2" color="text.secondary" mb={3}>
          {archivoNombre || "No se ha seleccionado ningún archivo"}
        </Typography>

        {datosExcel.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 200, overflow: "auto", mb: 2 }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(datosExcel[0]).map((key, i) => (
                    <TableCell key={i}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {datosExcel.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((val, i) => (
                      <TableCell key={i}>{val}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="contained" color="error" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubir}
            disabled={!archivoNombre || !rolSeleccionado}
          >
            Subir
          </Button>
        </Box>
      </Box>
    </Modal>

  );
};

export default ModalCargaMasiva;
