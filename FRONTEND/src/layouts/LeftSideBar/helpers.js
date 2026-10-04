const lightTheme = {
  label: {
    color: "#000000" // Negro para los títulos de sección
  },
  item: {
    color: "#000000",              // Negro para ítems normales
    hover: "#000000",              // Negro al pasar el mouse
    active: "#000000",             // Negro cuando está activo
    underlineOnActive: true        // Custom: lo usarás tú en tu componente
  }
};

const darkTheme = {
  label: {
    color: "#000000"
  },
  item: {
    color: "#000000",
    hover: "#000000",
    active: "#000000",
    underlineOnActive: true
  }
};

export const getLeftbarTheme = (themeMode) => {
  return themeMode === "light" ? lightTheme : darkTheme;
};
