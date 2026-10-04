import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, Modal, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { format } from "date-fns";

const ModalCargaMasiva = ({ open, onClose, cargarFormacionesMasivo }) => {
  const [archivoNombre, setArchivoNombre] = useState("");
  const [datosExcel, setDatosExcel] = useState([]);

  useEffect(() => {
    if (open) {
      setArchivoNombre("");
      setDatosExcel([]);
    }
  }, [open]);

  const handleArchivoExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivoNombre(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, {
        type: "binary",
        cellDates: true,
        raw: false
      });

      const hojaNombre = workbook.SheetNames[0];
      const hoja = workbook.Sheets[hojaNombre];

      const datos = XLSX.utils.sheet_to_json(hoja, { defval: "" });

      const datosFormateados = datos.map((row) => ({
        ...row,
        fecha_inicio: row.fecha_inicio instanceof Date ? format(row.fecha_inicio, "yyyy-MM-dd") : row.fecha_inicio,
        fecha_terminacion: row.fecha_terminacion instanceof Date ? format(row.fecha_terminacion, "yyyy-MM-dd") : row.fecha_terminacion,
      }));

      setDatosExcel(datosFormateados);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubir = async () => {
    onClose();
  if (datosExcel.length === 0) return;

  const registrosValidos = [];
  const errores = [];

  datosExcel.forEach((f, idx) => {
    let mensaje = "";

    if (!f.nombre_formacion || !f.periodo || !f.linea_cualificacion || !f.numero_horas ||
      !f.fecha_inicio || !f.fecha_terminacion) {
      mensaje = "Faltan campos obligatorios";
    } else if (new Date(f.fecha_inicio) >= new Date(f.fecha_terminacion)) {
      mensaje = "Fecha de inicio mayor o igual a la de terminación";
    }

    if (mensaje) {
      errores.push({
        ...f,
        mensaje: mensaje
      });
    } else {
      registrosValidos.push(f);
    }
  });

  if (registrosValidos.length === 0) {
    return Swal.fire({
      icon: "warning",
      title: "Todos los registros son inválidos",
      html: `
        <p>Todos los registros tienen datos faltantes o fechas incorrectas.</p>
        <p><b>No se cargó ningún dato.</b></p>
        <p>¿Quieres descargar un formato de ejemplo?</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Cerrar",
      cancelButtonText: "Descargar formato"
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        descargarFormatoEjemplo();
      }
    });
  }

  try {
    const response = await cargarFormacionesMasivo(registrosValidos);

    onClose();
    setArchivoNombre("");
    setDatosExcel([]);

    if (response.status === "SUCESSED" || response.success) {
      const exitosos = response.resumen.exitosos || [];
      const yaExistentes = response.resumen.yaExistentes || [];
      const fallidos = response.resumen.fallidos || [];

      const todosResultados = [
        ...exitosos.map(item => ({
          Nombre: item.nombre_formacion,
          Resultado: item.mensaje
        })),
        ...yaExistentes.map(item => ({
          Nombre: item.nombre_formacion,
          Resultado: item.mensaje
        })),
        ...fallidos.map(item => ({
          Nombre: item.nombre_formacion,
          Resultado: item.mensaje
        })),
        ...errores.map(item => ({
          Nombre: item.nombre_formacion || "(Sin nombre)",
          Resultado: item.mensaje
        }))
      ];

      Swal.fire({
        title: "Carga finalizada",
        icon: exitosos.length > 0 ? "success" : "info",
        html: `
          <p><b>Nuevas formaciones creadas:</b> ${exitosos.length}</p>
          <p><b>Ya existentes:</b> ${yaExistentes.length}</p>
          <p><b>Fallidos:</b> ${fallidos.length}</p>
          <p><b>Omitidos (inválidos):</b> ${errores.length}</p>
          <p>Haz clic en el botón para descargar el resumen.</p>
        `,
        showCancelButton: true,
        cancelButtonText: "Descargar Excel",
        confirmButtonText: "Cerrar"
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          const ws = XLSX.utils.json_to_sheet(todosResultados);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Resumen");
          XLSX.writeFile(wb, "ResumenCargaFormaciones.xlsx");
        }
      });

    } else {
      Swal.fire("Error", response.error || "Error inesperado en la carga", "error");
    }

  } catch (error) {
    console.error("Error en carga:", error);
    Swal.fire("Error", "Ocurrió un error inesperado", "error");
  }
};


  const descargarFormatoEjemplo = () => {
    const ejemploFormato = [
      {
        nombre_formacion: "Desarrollo Web",
        periodo: "2024-I",
        linea_cualificacion: "Tecnologías",
        numero_horas: 120,
        fecha_inicio: "2024-01-15",
        fecha_terminacion: "2024-03-15",
        observaciones: "Curso introductorio a HTML"
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(ejemploFormato);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FormatoEjemplo");
    XLSX.writeFile(workbook, "FormatoCargaFormaciones.xlsx");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: '60%', sm: 500, md: 600 },
        bgcolor: "background.paper",
        p: 4,
        borderRadius: 2,
        boxShadow: 14,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <Typography variant="h6" textAlign="center" mb={2} fontWeight="bold">
          Carga masiva de formaciones
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Sube un archivo <b>.csv</b> o <b>.xlsx</b> con las formaciones a registrar.
        </Typography>

        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          Elegir archivo
          <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleArchivoExcel} />
        </Button>

        <Typography variant="body2" color="text.secondary" mb={3}>
          {archivoNombre || "No se ha seleccionado ningún archivo"}
        </Typography>

        {datosExcel.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 200, overflow: "auto", mb: 2 }}>
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
                      <TableCell key={i}>{val?.toString()}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
          <Button variant="outlined" onClick={descargarFormatoEjemplo}>
            Descargar formato
          </Button>
          <Button variant="contained" color="error" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubir}
            disabled={!archivoNombre}
          >
            Subir
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalCargaMasiva;
