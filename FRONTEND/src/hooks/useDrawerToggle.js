import { useState } from "react";
const useDrawerToggle = () => {
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  });
  const toggleDrawer = (anchor, open) => event => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setState({
      ...state,
      [anchor]: open
    });
  };
  return {
    state,
    toggleDrawer
  };
};
export default useDrawerToggle;