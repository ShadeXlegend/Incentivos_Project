import { Box } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { keyframes } from "@emotion/react";

const twinkle = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
`;

const AuthBGLayout = ({ children }) => {
  const stars = Array.from({ length: 30 }).map((_, index) => {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = Math.random() * 20 + 10; // size between 10px and 30px
    const duration = Math.random() * 3 + 2; // 2s to 5s

    return (
      <StarIcon
        key={index}
        sx={{
          position: "absolute",
          top: `${top}%`,
          left: `${left}%`,
          fontSize: `${size}px`,
          color: "rgba(255, 255, 255, 0.8)",
          animation: `${twinkle} ${duration}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
          pointerEvents: "none"
        }}
      />
    );
  });

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100vw",
        overflow: "hidden",
        minHeight: "100vh",
        backgroundColor: theme =>
          theme.palette.mode === "light" ? "#f0f4ff" : "#0b0f1a"
      }}
    >
      {/* Estrellas brillantes */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>{stars}</Box>

      {/* Contenido */}
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
};

export default AuthBGLayout;
