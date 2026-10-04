/*

 * File Name: index.tsxAuthor: Miguel Ángel Noel García*/

import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { LuX } from "react-icons/lu";
import SimpleBar from "simplebar-react";
import LayoutThemeToggler from "./LayoutThemeToggler";
import SidenavModeToggler from "./SidenavModeToggler";
import SidenavThemeToggler from "./SidenavThemeToggler";
import { useLayoutContext } from "../../../states";
const ThemeCustomizer = () => {
  const {
    settings,
    themeMode,
    updateSidenav,
    updateTheme,
    updateShowRightsideBar,
    resetSettings
  } = useLayoutContext();
  const handleChangeLayoutTheme = theme => updateTheme(theme);
  const handleChangeSidenavMode = mode => updateSidenav({
    mode: mode
  });
  const handleChangeSidenavTheme = theme => updateSidenav({
    theme: theme
  });
  return <>
      <Box sx={{
      height: 70,
      minHeight: 70,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#3e60d5",
      gap: "12px",
      px: "24px"
    }}>
        <Typography sx={{
        color: "white"
      }} variant={"subtitle1"}>
          Configuración de Aspecto
        </Typography>
        <IconButton sx={{
        color: "white"
      }} onClick={() => updateShowRightsideBar(false)}>
          <LuX />
        </IconButton>
      </Box>

      <SimpleBar style={{
      height: "calc(100% - 70px)"
    }}>
        <Stack padding={"20px"} gap={2}>
          <LayoutThemeToggler handleChangeLayoutTheme={handleChangeLayoutTheme} layoutTheme={themeMode} />

          <SidenavModeToggler handleChangeSidenavMode={handleChangeSidenavMode} sidenavMode={settings.sidenav.mode} />

          <SidenavThemeToggler handleChangeSidenavTheme={handleChangeSidenavTheme} sidenavTheme={settings.sidenav.theme} />
        </Stack>
      </SimpleBar>

      <Box sx={{
      height: 64,
      display: "flex",
      alignItems: "center",
      gap: 16,
      borderTopWidth: 1,
      borderColor: "#d1d5db"
    }}>
        <Button sx={{
        mx: "20px"
      }} onClick={() => resetSettings()} variant="contained" color="primary" fullWidth>
          Por Defecto
        </Button>
      </Box>
    </>;
};
export default ThemeCustomizer;