import React, { useState } from 'react';
import { Box, Button, Menu, TextField, MenuItem } from '@mui/material';

const FiltrosFormaciones = ({ anchorEl, handleClose, onAplicarFiltros }) => {
  const open = Boolean(anchorEl);

  const [linea, setLinea] = useState("Todos");
  const [periodo, setPeriodo] = useState("Todos");
  const [horas, setHoras] = useState("Todos");

  const aplicarFiltros = () => {
    onAplicarFiltros({ linea, periodo, horas });
    handleClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 500,
            px: 2,
            py: 2,
          },
        },
      }}
    >
      <Box
        component="form"
        autoComplete="off"
        noValidate
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField select label="Línea de Cualificación" value={linea} onChange={(e) => setLinea(e.target.value)} size="small" sx={{ minWidth: 180 }}>
          <MenuItem value="Todos">Todos</MenuItem>
          <MenuItem value="Docencia">Docencia</MenuItem>
          <MenuItem value="Investigación">Investigación</MenuItem>
          <MenuItem value="TIC">TIC</MenuItem>
          <MenuItem value="Administrativa">Administrativa</MenuItem>
        </TextField>

        <TextField select label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)} size="small" sx={{ minWidth: 140 }}>
          <MenuItem value="Todos">Todos</MenuItem>
          <MenuItem value="2024">2024</MenuItem>
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2022">2022</MenuItem>
        </TextField>

        <TextField select label="Horas" value={horas} onChange={(e) => setHoras(e.target.value)} size="small" sx={{ minWidth: 120 }}>
          <MenuItem value="Todos">Todos</MenuItem>
          <MenuItem value="20">20</MenuItem>
          <MenuItem value="40">40</MenuItem>
          <MenuItem value="80">80</MenuItem>
          <MenuItem value="100">100</MenuItem>
        </TextField>

        <Button variant="contained" color="primary" onClick={aplicarFiltros}>
          Aplicar
        </Button>
      </Box>
    </Menu>
  );
};

export default FiltrosFormaciones;
