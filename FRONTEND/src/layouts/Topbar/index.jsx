import { Box, FilledInput, InputAdornment } from "@mui/material";
import { LuSearch } from "react-icons/lu";
import { styled } from "@mui/material";
import { useLayoutContext } from "@src/states";
import MenuToggler from "./MenuToggler";
import MaximizeScreen from "./MaximizeScreen";
import LayoutThemeToggler from "./LayoutThemeToggler";
import ThemeCustomizerToggler from "./ThemeCustomizerToggler";
import LanguageDropdown from "./LanguageDropdown";
import UserProfile from "./UserProfile";
const TopBarWrapper = styled("div")(({
  theme,
  settings
}) => {
  return {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.mode === "dark" ? "#fff" : "#000",
    paddingInlineStart: "16px",
    paddingInlineEnd: "1px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70px",
    minHeight: "70px",
    borderRadius: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / .1)",
    zIndex: 2,
    position: "sticky",
    top: 0
  };
});
const Topbar = () => {
  const {
    settings
  } = useLayoutContext();
  return <TopBarWrapper settings={settings} className="topbar-header-do-not-remove">
    <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: 2
    }}>
      <MenuToggler />

      {/* <Box sx={{
        maxWidth: "203px",
        display: {
          xs: "none",
          md: "block"
        }
      }}>
          <FilledInput placeholder="Busqueda" startAdornment={<InputAdornment position="end">
                <InputAdornment position="start">
                  <LuSearch size={14} />
                </InputAdornment>
              </InputAdornment>} sx={{
          pl: 0,
          "&:hover": {
            borderBottom: 0
          },
          "&:before": {
            borderBottom: 0
          },
          "& > .MuiInputBase-input": {
            py: "8px"
          }
        }} />
        </Box> */}
    </Box>

    <Box sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 1.5
    }} alignItems={"center"}>
      <Box sx={{
        display: {
          lg: "block",
          xs: "block"
        }
      }}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5
        }}>
          {/* <LanguageDropdown /> */}
        </Box>
      </Box>

      {/* <ThemeCustomizerToggler /> */}

      <LayoutThemeToggler />
      <Box sx={{
        display: {
          xs: "none",
          sm: "block"
        }
      }}>
        {/* <MaximizeScreen /> */}
      </Box>
      <UserProfile />
    </Box>
  </TopBarWrapper>;
};
export default Topbar;