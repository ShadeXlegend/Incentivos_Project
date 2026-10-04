import { Drawer } from "@mui/material";
import ThemeCustomizer from "./ThemeCustomizer";
import { useLayoutContext } from "../../states";
const RightSideBar = () => {
  const {
    settings: {
      showRightsideBar
    },
    updateShowRightsideBar
  } = useLayoutContext();
  return <Drawer anchor={"right"} open={showRightsideBar} onClose={() => updateShowRightsideBar(false)} PaperProps={{
    sx: {
      width: "288px"
    }
  }}>
      <ThemeCustomizer />
    </Drawer>;
};
export default RightSideBar;