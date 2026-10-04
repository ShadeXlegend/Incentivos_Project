import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Divider
} from "@mui/material";
import { Cancel, DoneAll } from "@mui/icons-material";
import Swal from 'sweetalert2';
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import "font-awesome/css/font-awesome.min.css";
import { useRoles } from "./useRoles";

const RolForm = ({ rol, reset }) => {
  const {
    guardarInterfacesPorRol,
    obtenerDatosDePermisosPorRol
  } = useRoles();

  const [formData, setFormData] = useState(rol);
  const [treeData, setTreeData] = useState([]);
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState(["vistas", "seguridad"]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { treeData, checked } = await obtenerDatosDePermisosPorRol(rol.id_rol);
        setTreeData(treeData);
        setChecked(checked);
        setFormData(rol);
      } catch (error) {
        console.error("Error al cargar interfaces:", error);
      }
    };

    if (rol?.id_rol) {
      cargar();
    }
  }, [rol]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idInicio = '11111111-1111-1111-1111-111111111108';
    const checkedWithInicio = checked.includes(idInicio)
      ? checked
      : [...checked, idInicio];

    try {
      await guardarInterfacesPorRol(rol.id_rol, checkedWithInicio);

      Swal.fire({
        icon: 'success',
        title: 'Guardado correctamente',
        text: 'Los permisos han sido actualizados.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#7C4DFF',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar los permisos.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#7C4DFF',
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Divider sx={{ fontFamily: "'Poppins','Roboto',sans-serif" }}>
        Editar {formData.nombre}
      </Divider>

      <TextField
        fullWidth
        label="Código del rol"
        value={`R${String(formData.id_rol).padStart(3, '0')}`}
        variant="outlined"
        disabled
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="Nombre del rol"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        disabled
      />

      <Divider sx={{ fontFamily: "'Poppins','Roboto',sans-serif" }}>
        Permisos por vista
      </Divider>

      <CheckboxTree
        nodes={treeData}
        checked={checked}
        expanded={expanded}
        onCheck={(c) => setChecked(c)}
        onExpand={(e) => setExpanded(e)}
        iconsClass="fa5"
        showExpandAll
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="contained" onClick={reset} color="error" startIcon={<Cancel />}>
          Cancelar
        </Button>
        <Button variant="contained" color="success" type="submit" startIcon={<DoneAll />}>
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default RolForm;
