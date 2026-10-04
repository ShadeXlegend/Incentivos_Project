import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageMetaData } from "@src/components";
import AuthLayout from "../AuthLayout";
import { useAuthContext } from "../../../states";
import { useEffect } from "react";

/**
 * Bottom Links goes here
 */
const BottomLink = () => <Box sx={{
  my: "16px",
  display: "flex",
  justifyContent: "center"
}}>
    <Typography variant="body2" color={"text.secondary"} sx={{
    display: "flex",
    flexWrap: "nowrap",
    gap: 0.5
  }}>
      Volver al
      <Link to="/auth/login">
        <Typography variant="subtitle2" component={"span"}>
          Inicio
        </Typography>
      </Link>
    </Typography>
  </Box>;
export const LogoutIcon = () => <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 161.2 161.2" enableBackground="new 0 0 161.2 161.2" xmlSpace="preserve">
    
    <path className="path" fill="none" stroke="#0acf97" strokeMiterlimit="10" d="M425.9,52.1L425.9,52.1c-2.2-2.6-6-2.6-8.3-0.1l-42.7,46.2l-14.3-16.4 c-2.3-2.7-6.2-2.7-8.6-0.1c-1.9,2.1-2,5.6-0.1,7.7l17.6,20.3c0.2,0.3,0.4,0.6,0.6,0.9c1.8,2,4.4,2.5,6.6,1.4c0.7-0.3,1.4-0.8,2-1.5 c0.3-0.3,0.5-0.6,0.7-0.9l46.3-50.1C427.7,57.5,427.7,54.2,425.9,52.1z" />
    <circle className="path" fill="none" stroke="#0acf97" strokeWidth="4" strokeMiterlimit="10" cx="80.6" cy="80.6" r="62.1" />
    <polyline className="path" fill="none" stroke="#0acf97" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" points="113,52.8 74.1,108.4 48.2,86.4 " />
    <circle className="spin" fill="none" stroke="#0acf97" strokeWidth="4" strokeMiterlimit="10" strokeDasharray="12.2175,12.2175" cx="80.6" cy="80.6" r="73.9" />
  </svg>;
const Logout = () => {
  const {removeSession} = useAuthContext();
  useEffect(() => {
    removeSession();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/auth/login"; 
  }, []);
  return <>
      <PageMetaData title={"Fin de sesión"} />

      <AuthLayout authTitle="Nos vemos pronto!" helpText="La sesión ha sido cerrada correctamente." bottomLinks={<BottomLink />}>
        <Box sx={{
        width: 144,
        mx: "auto"
      }}>
          <LogoutIcon />
        </Box>
      </AuthLayout>
    </>;
};
export default Logout;