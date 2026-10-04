/*

 * File Name: SidenavModeToggler.tsxAuthor: Miguel Ángel Noel García*/

import { Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { LuPanelRight, LuPanelRightOpen } from "react-icons/lu";
const SidenavModeToggler = ({
  handleChangeSidenavMode,
  sidenavMode
}) => {
  return <>
      <div>
        <Typography variant={"subtitle2"} fontWeight={500}>
          Sidenav Mode
        </Typography>

        <Stack direction={"row"} gap={2} mt={1}>
          <Box sx={{
          border: 1,
          display: "inline-flex",
          p: 1.5,
          borderColor: "divider",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": sidenavMode == "default" ? {} : {
            backgroundColor: "grey.200",
            borderColor: "grey.200"
          },
          ...(sidenavMode == "default" ? {
            backgroundColor: "primary.lighter",
            borderColor: "primary.lighter",
            color: "primary.darker"
          } : {})
        }} onClick={() => handleChangeSidenavMode("default")}>
            <LuPanelRight size={24} style={{
            transform: "rotate(180deg)"
          }} />
          </Box>
          <Box sx={{
          border: 1,
          display: "inline-flex",
          p: 1.5,
          borderColor: "divider",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": sidenavMode == "mobile" ? {} : {
            backgroundColor: "grey.200",
            borderColor: "grey.200"
          },
          ...(sidenavMode == "mobile" ? {
            backgroundColor: "primary.lighter",
            borderColor: "primary.lighter",
            color: "primary.darker"
          } : {})
        }} onClick={() => handleChangeSidenavMode("mobile")}>
            <LuPanelRightOpen size={24} />
          </Box>
        </Stack>
      </div>
    </>;
};
export default SidenavModeToggler;