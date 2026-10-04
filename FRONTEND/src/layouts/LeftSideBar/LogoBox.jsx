import { Link } from "react-router-dom";
import logo from "../../assets/images/udc.png";
import logoDark from "../../assets/images/UnicartagenaLogo.png";
import { useLayoutContext } from "@src/states";
import { styled } from "@mui/system";
const LogoBox = ({
  defaultTheme,
  backgroundColor
}) => {
  const {
    settings
  } = useLayoutContext();
  const {
    sidenav: {
      theme
    }
  } = settings;
  const LogoBoxWrapper = styled("div")(({
    settings
  }) => {
    return {
      backgroundColor: backgroundColor ? settings.sidenav.theme == "light" ? "#FFE18D  " : "#FACC45" : "transparent",
      height: "70px",
      position: "sticky",
      top: 20,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2
    };
  });
  return <LogoBoxWrapper settings={settings}>
      <Link to="/inicio" style={{
      justifyContent: "center",
      display: "flex"
    }}>
        <img src={(defaultTheme ?? theme) == "light" ? logo : logo} height={82} width={180} />
      </Link>
    </LogoBoxWrapper>;
};
export default LogoBox;