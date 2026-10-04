import { Avatar, Box, Button, ListItemAvatar, ListItemText, Menu, MenuItem } from "@mui/material";
import country1 from "../../assets/images/flags/colombia16x16.png";
import country2 from "../../assets/images/flags/Canada.png";
import country3 from "../../assets/images/flags/Bharat.png";
import country4 from "../../assets/images/flags/Japan.png";
import country5 from "../../assets/images/flags/UK.png";
import country6 from "../../assets/images/flags/US.png";
import { LuChevronDown } from "react-icons/lu";
import { useDropdownMenu } from "../../hooks";
import { useTranslation } from 'react-i18next'; // Importar useTranslation

const LanguageDropdown = () => {
  const { t, i18n } = useTranslation(); // Usar useTranslation
  const selectedLanguage = country3; // Asegúrate de que el idioma por defecto sea correcto

  const {
    anchorEl,
    open,
    handleClick,
    handleClose
  } = useDropdownMenu();

  // Función para cambiar el idioma
  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  return (
    <Box sx={{
      cursor: "pointer",
      gap: 1,
      alignItems: "center",
      display: "flex",
      height: "100%",
      width: "auto"
    }}>
      <Button
        sx={{
          color: "text.secondary"
        }}
        onClick={handleClick}
        variant="text"
        startIcon={<Avatar variant="square" sx={{ width: 18, height: 12 }} src={selectedLanguage} />}
        endIcon={<LuChevronDown />}
      >
        {t('language')} {/* Usar la traducción para el texto del botón */}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        <MenuItem onClick={() => handleLanguageChange('en')}>
          <ListItemAvatar sx={{ minWidth: "25px" }}>
            <img src={country6} height={"12px"} width={"18px"} />
          </ListItemAvatar>
          <ListItemText>{t('english')}</ListItemText> {/* Usar la traducción */}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('es')}>
          <ListItemAvatar sx={{ minWidth: "25px" }}>
            <img src={country1} height={"12px"} width={"18px"} />
          </ListItemAvatar>
          <ListItemText>{t('Colombia')}</ListItemText> {/* Usar la traducción */}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('fr')}>
          <ListItemAvatar sx={{ minWidth: "25px" }}>
            <img src={country2} height={"12px"} width={"18px"} />
          </ListItemAvatar>
          <ListItemText>{t('canada')}</ListItemText> {/* Usar la traducción */}
        </MenuItem>
       
       
      </Menu>
    </Box>
  );
};

export default LanguageDropdown;
