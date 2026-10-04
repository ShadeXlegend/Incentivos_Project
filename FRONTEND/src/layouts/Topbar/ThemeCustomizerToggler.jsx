/*

 * File Name: ThemeCustomizerToggler.tsxAuthor: Miguel Ángel Noel García*/

import { IconButton } from "@mui/material";
import { useLayoutContext } from "../../states";
import { LuSettings } from "react-icons/lu";
import { useTranslation } from 'react-i18next';

const ThemeCustomizerToggler = () => {
  const { t } = useTranslation(); // Usar useTranslation
  const {
    settings: {
      showRightsideBar
    },
    updateShowRightsideBar: updateShowRightsideBar
  } = useLayoutContext();
  const handleRightsideBar = () => {
    updateShowRightsideBar(!showRightsideBar);
  };
  return <>
      <IconButton color={"inherit"} onClick={handleRightsideBar} title={t('settings')}>
        <LuSettings />
      </IconButton>
    </>;
};
export default ThemeCustomizerToggler;