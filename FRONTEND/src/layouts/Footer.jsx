/*

 * File Name: Footer.tsxAuthor: Miguel Ángel Noel García*/

import { Stack, Typography, styled } from "@mui/material";
import { useLayoutContext } from "../states";
const FooterWrapper = styled("div")(({
  theme,
  settings
}) => {
  return {
    backgroundColor: theme.palette.background.paper,
    height: "auto",
    minHeight: "80px",
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 14px",
    
  };
});
const Footer = () => {
  const {
    settings
  } = useLayoutContext();
  return <FooterWrapper settings={settings} className="footer-do-not-remove">
      <Typography variant="subtitle2" color={"text.primary"} sx={{ fontSize: "12px" }}>
        2024 - {new Date().getFullYear()} © Universidad de Cartagena S.A Powered by UDC
      </Typography>
      <Stack direction={"row"} spacing={2} sx={{
      display: "flex"
    }}>
      </Stack>
    </FooterWrapper>;
};
export default Footer;