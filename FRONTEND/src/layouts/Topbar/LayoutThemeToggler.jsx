/*

 * File Name: LayoutThemeToggler.tsxAuthor: Miguel Ángel Noel García*/

import { IconButton } from "@mui/material";
import { useLayoutContext } from "../../states";
import { LuMoon, LuSunMedium } from "react-icons/lu";
import { useTranslation } from 'react-i18next';

const LayoutThemeToggler = () => {
  const { t } = useTranslation();
  const {
    themeMode,
    updateTheme
  } = useLayoutContext();
  return <IconButton color={"inherit"} onClick={() => updateTheme(themeMode == "light" ? "dark" : "light")} title={t('theme_toggle')}>
      {themeMode == "light" ? <LuMoon /> : <LuSunMedium />}
    </IconButton>;
};
export default LayoutThemeToggler;