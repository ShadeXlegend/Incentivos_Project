import { Avatar, Box, Card, CardContent, IconButton, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useLayoutContext } from "../../states";

//images
import logo from "../.././assets/images/UnicartagenaLogo.png";
import logoDark from "../.././assets/images/UnicartagenaLogo.png";
import bgAuth from "../.././assets/images/bg-auth.jpg";
import { FiFacebook } from "react-icons/fi";
import { TbBrandGoogle } from "react-icons/tb";
import { LuGithub, LuQuote, LuTwitter } from "react-icons/lu";
import "swiper/css";
const AuthLayout2 = ({
  pageImage,
  authTitle,
  helpText,
  bottomLinks,
  children,
  hasThirdPartyLogin
}) => {
  const {
    themeMode
  } = useLayoutContext();
  return <Box sx={{
    display: "flex",
    alignItems: "stretch",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    backgroundRepeat: "no-repeat",
    backgroundImage: "url(" + bgAuth + ")"
  }}>
      <Card sx={{
      zIndex: 10,
      width: "100%",
      maxWidth: {
        lg: "480px"
      },
      height: "100vh"
    }}>
        <CardContent sx={{
        p: "48px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-around"
      }}>
          <Box sx={{
          marginBottom: "32px",
          textAlign: {
            lg: "start",
            xs: "center"
          },
          "& > a": {
            display: "flex",
            textAlign: {
              lg: "start",
              xs: "center"
            }
          }
        }}>
            <Link to="/">
              {themeMode == "dark" ? <img src={logo} alt="logo" style={{
              height: 90
            }} /> : <img src={logoDark} alt="logo" style={{
              height: 90
            }} />}
            </Link>
          </Box>
          <Box sx={{
          textAlign: "center"
        }}>
            {pageImage && <Avatar src={pageImage} alt="avatar" variant="square" sx={{
            height: "64px",
            width: "64px",
            mx: "auto",
            mb: "24px"
          }} />}

            <Typography variant="h4" sx={{
            mb: 1
          }}>
              {authTitle}
            </Typography>
            <Typography variant="body2" sx={{
            mb: "36px"
          }} color={"text.secondary"}>
              {helpText}
            </Typography>

            {children}

            {hasThirdPartyLogin && <Box sx={{
            textAlign: "center",
            mt: "36px"
          }}>
                {/* <Typography variant="body1" sx={{
              color: "grey.600",
              marginBottom: "24px"
            }}>
                  Registrarse con
                </Typography> */}
                {/* <Box sx={{
              display: "flex",
              gap: "8px",
              justifyContent: "center"
            }}>
                  <IconButton sx={{
                height: "32px",
                width: "32px",
                lineHeight: "28px",
                border: "2px solid #3e61d5",
                borderRadius: "100%"
              }}>
                    <FiFacebook size={24} />
                  </IconButton>
                  <IconButton sx={{
                height: "32px",
                width: "32px",
                lineHeight: "28px",
                border: "2px solid #f15776",
                borderRadius: "100%"
              }}>
                    <TbBrandGoogle size={24} />
                  </IconButton>
                  <IconButton sx={{
                height: "32px",
                width: "32px",
                lineHeight: "28px",
                border: "2px solid #16a6e9",
                borderRadius: "100%"
              }}>
                    <LuTwitter size={24} />
                  </IconButton>
                  <IconButton sx={{
                height: "32px",
                width: "32px",
                lineHeight: "28px",
                border: "2px solid #6c757d",
                borderRadius: "100%"
              }}>
                    <LuGithub size={24} />
                  </IconButton>
                </Box> */}
              </Box>}
          </Box>

          <Box sx={{}}>{bottomLinks}</Box>
        </CardContent>
      </Card>

      <Box sx={{
      bgcolor: "#0000004d",
      width: "100%",
      height: "100vh",
      position: "relative",
      display: {
        lg: "flex",
        xs: "hidden"
      },
      alignItems: "end"
    }}>
        <Box sx={{
        position: "absolute",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        display: "flex",
        marginTop: "auto",
        justifyContent: "center",
        textAlign: "center"
      }}>
          <Box sx={{
          width: {
            xl: "50%",
            xs: "100%"
          },
          mx: "auto"
        }}>
            <Swiper spaceBetween={50} slidesPerView={1} modules={[Autoplay]} loop={true} autoplay={{
            delay: 5000
          }}>
              <SwiperSlide>
                <Typography variant="h2" sx={{
                color: "white",
                mb: "24px"
              }}>
                  ¡Me encanta el color!
                  </Typography>
                <Typography variant="subtitle1" sx={{
                color: "white",
                mb: "20px",
                display: "flex",
                gap: 0.5
              }}>
                  <LuQuote size={16} style={{
                  transform: "scaleX(-1)"
                }} />
                 Todo lo que necesitas está en esta plantilla. Me encanta el aspecto general y la sensación. No es demasiado llamativa, pero sigue siendo
                 muy profesional e inteligente.
                  <LuQuote size={16} />
                </Typography>
                <Typography variant="caption" sx={{
                color: "white",
                mx: "auto"
              }}>
                                  - Usuario Admin
                </Typography>
              </SwiperSlide>

              <SwiperSlide>
                <Typography variant="h2" sx={{
                color: "white",
                mb: "24px"
              }}>
                  Conoce de nosotros, Nautiagro!
                </Typography>
                <Typography variant="subtitle1" sx={{
                color: "white",
                mb: "20px",
                display: "flex",
                gap: 0.5
              }}>
                  <LuQuote size={16} style={{
                  transform: "scaleX(-1)"
                }} />
                  Tema bastante bueno, espero que puedan agregar más funciones a esto. Sigan con el buen trabajo.
                  <LuQuote size={16} />
                </Typography>
                <Typography variant="caption" sx={{
                color: "white",
                mx: "auto"
              }}>
                  - Admin User
                </Typography>
              </SwiperSlide>

              <SwiperSlide>
                <Typography variant="h2" sx={{
                color: "white",
                mb: "24px"
              }}>
                  Adapatable a tus gustos!
                </Typography>
                <Typography variant="subtitle1" sx={{
                color: "white",
                mb: "20px",
                display: "flex",
                gap: 0.5
              }}>
                  <LuQuote size={16} style={{
                  transform: "scaleX(-1)"
                }} />
                  Este es un gran producto, nos ayudó mucho y es muy rápido de trabajar e implementar.
                  <LuQuote size={16} />
                </Typography>
                <Typography variant="caption" sx={{
                color: "white",
                mx: "auto"
              }}>
                  - Usuario Admin
                  </Typography>
              </SwiperSlide>
            </Swiper>
          </Box>
        </Box>
      </Box>
    </Box>;
};
export default AuthLayout2;