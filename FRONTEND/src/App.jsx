import { useEffect } from "react";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import Router from "./routes/Router";
import { createTheme } from "theme";
import { useLayoutContext } from "states";
import './layouts/Topbar/traduccion/i18n'
import logo from './logo.svg';
import './App.css';
const App = () => {
  const {
    settings
  } = useLayoutContext();
  // useEffect(() => {
  //   ;
  // }, []);
  return <>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={createTheme(settings.theme)}>
        <Router />
      </ThemeProvider>
    </StyledEngineProvider>
  </>;
};
export default App;