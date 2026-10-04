/*
 * Copyright (c) 2023.
 * File Name: index.tsx
 * Author: Coderthemes
 */

import { Drawer, styled } from "@mui/material";
import LogoBox from "./LogoBox";
import SimpleBar from "simplebar-react";
import AppMenu from "./AppMenu";
import { changeHTMLAttribute, getMenuItems } from "@src/helpers/menu";
import { useLayoutContext } from "@src/states";
import { useViewPort } from "@src/hooks";
import { useEffect } from "react";

/* Sidemenu content */
const SideBarContent = () => <AppMenu menuItems={getMenuItems()} />;
const LeftSideBarWrapper = styled("div")(({
  settings
}) => {
  return {
    backgroundColor: settings.sidenav.theme == "light" ? "#FFE18D  " : "#FACC45",
    width: 240,
    minWidth: 240,
   
    height: "100vh",
    position: "sticky",
    top: 0,
    overflow: "hidden",  
    // transform: "translateX(-100%)"
    marginInlineStart: !settings.sidenav.showMobileMenu ? -240 : 0,
    transition: "0.6s margin",
 
    
  };
});
const LeftSideBarMenu = () => {
  const {
    settings
  } = useLayoutContext();
  return <LeftSideBarWrapper settings={settings} className="app-menu-do-not-remove" >
      <LogoBox backgroundColor />
      <SimpleBar style={{
      height: "calc(100% - 70px)"
      
    }}>
        <SideBarContent />
      </SimpleBar>
    </LeftSideBarWrapper>;
};
const LeftSideBar = () => {
  const {
    width
  } = useViewPort();
  const {
    settings,
    updateSidenav
  } = useLayoutContext();
  const showMobileMenu = settings.sidenav.showMobileMenu;
  useEffect(() => {
    changeHTMLAttribute("data-mode", settings.theme);
  }, [settings.theme]);
  useEffect(() => {
    changeHTMLAttribute("data-menu-color", settings.sidenav.theme);
  }, [settings.sidenav.theme]);
  useEffect(() => {
    changeHTMLAttribute("data-sidenav-view", settings.sidenav.mode);
  }, [settings.sidenav.mode]);
  useEffect(() => {
    if (width < 1140) {
      updateSidenav({
        mode: "mobile"
      });
    } else if (width >= 1140 && settings.sidenav.mode == "mobile") {
      updateSidenav({
        mode: "default"
      });
    }
  }, [width]);
  const hideSideNavMobile = () => {
    // const htmlElement = document.getElementsByTagName("html")[0];
    // htmlElement.classList.remove("sidenav-enable");
    updateSidenav({
      showMobileMenu: false
    });
  };
  return settings.sidenav.mode == "default" ? <LeftSideBarMenu /> : <Drawer open={showMobileMenu} onClose={hideSideNavMobile} PaperProps={{
    sx: {
      borderTopRightRadius: "30px",
      borderBottomRightRadius: "30px",
      overflow: "hidden"
    }
  }}>
      <LeftSideBarMenu />
    </Drawer>;
};
export default LeftSideBar;