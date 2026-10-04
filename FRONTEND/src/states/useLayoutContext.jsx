/*

 * File Name: useLayoutContext.tsxAuthor: Miguel Ángel Noel García*/

import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
const ThemeContext = createContext(undefined);
const useLayoutContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useLayoutContext can only be used within LayoutProvider");
  }
  return context;
};
const LayoutProvider = ({
  children
}) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const INIT_STATE = {
    theme: params["layout_theme"] === "dark" ? "dark" : "light",
    sidenav: {
      mode: params["sidenav_mode"] === "mobile" ? "mobile" : "default",
      theme: params["sidenav_theme"] === "light" ? "light" : "dark",
      showMobileMenu: true
    },
    showRightsideBar: false
  };
  const [settings, setSettings] = useLocalStorage("__CONFIG__", INIT_STATE);
  const themeMode = settings.theme;

  // update settings
  const updateSettings = _newSettings => setSettings({
    ...settings,
    ..._newSettings
  });
  const updateTheme = newTheme => {
    setSettings({
      ...settings,
      theme: newTheme
    });
  };
  const updateSidenav = newSidenav => updateSettings({
    sidenav: {
      ...settings.sidenav,
      ...newSidenav
    }
  });
  const updateShowRightsideBar = show => setSettings({
    ...settings,
    showRightsideBar: show
  });
  const resetSettings = () => {
    setSettings(INIT_STATE);
  };
  return <ThemeContext.Provider value={{
    settings,
    themeMode,
    updateTheme,
    updateSidenav,
    updateShowRightsideBar,
    resetSettings
  }}>
      {children}
    </ThemeContext.Provider>;
};
export { useLayoutContext, LayoutProvider };