import { Link } from "react-router-dom";

//image
import logo from "../../assets/images/UnicartagenaLogo.png";
import startMan from "../../assets/images/svg/startman.svg";

// components
import { AuthBGLayout, PageMetaData } from "@src/components";
import { Avatar, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { LuAntenna } from "react-icons/lu";
const Error404 = () => {
  return <>
      <PageMetaData title="Error 404" />
      <AuthBGLayout>
        <Box sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }}>
          <Box sx={{
          display: "flex",
          justifyContent: "center"
        }}>
            <Box sx={{
            maxWidth: "448px"
          }}>
              <Card sx={{
              borderRadius: 2,
              width: 416
            }}>
                <CardContent sx={{
                backgroundColor: "primary.main",
                p: "36px"
              }}>
                  <Link to="/" style={{
                  display: "flex",
                  justifyContent: "center"
                }}>
                    <img src={logo} alt="logo" height={24} />
                  </Link>
                </CardContent>
                <CardContent sx={{
                px: "24px",
                py: "40px"
              }}>
                  <Box sx={{
                  textAlign: "center"
                }}>
                    <Avatar src={startMan} alt="startman-svg" sx={{
                    height: "128px",
                    width: "128px",
                    mx: "auto",
                    mb: "35px"
                  }} />
                    <Typography component={"h1"} sx={{
                    fontSize: "72px",
                    color: "primary.main",
                    fontWeight: 500
                  }}>
                      500
                    </Typography>
                    <Typography component={"h4"} sx={{
                    color: "error.main",
                    fontSize: "18px",
                    textTransform: "uppercase",
                    my: "18px",
                    fontWeight: 600
                  }}>
                      INTERNAL SERVER ERROR
                    </Typography>
                    <Typography component={"p"} sx={{
                    fontSize: "12px",
                    color: "grey.600"
                  }}>
                      Why not try refreshing your page? or you can contact Support
                    </Typography>
                    <Button sx={{
                    mt: "40px"
                  }} size="medium" variant="contained" color="info" startIcon={<LuAntenna size={18} />}>
                      Return Home
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Box sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
      }}>
          <Link to={"https://coderthemes.com/"} target="_blank" style={{
          textDecoration: "none"
        }}>
            <Typography variant="body2" sx={{
            textAlign: "center",
            p: "24px"
          }} color={"text.secondary"}>
              {new Date().getFullYear()} © Attex - Coderthemes.com
            </Typography>
          </Link>
        </Box>
      </AuthBGLayout>
    </>;
};
export default Error404;