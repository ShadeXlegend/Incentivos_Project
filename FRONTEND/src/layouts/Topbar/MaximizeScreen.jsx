import { IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { LuMaximize, LuMinimize } from "react-icons/lu";

const MaximizeScreen = () => {
  const [fullScreenOn, setFullScreenOn] = useState(false);

  const toggleFullScreen = () => {
    const el = document.documentElement;

    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
      setFullScreenOn(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      setFullScreenOn(false);
    }
  };

  useEffect(() => {
    const exitHandler = () => {
      setFullScreenOn(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);

    return () => {
      document.removeEventListener("fullscreenchange", exitHandler);
      document.removeEventListener("webkitfullscreenchange", exitHandler);
      document.removeEventListener("mozfullscreenchange", exitHandler);
    };
  }, []);

  return (
    <IconButton color="inherit" onClick={toggleFullScreen}>
      {fullScreenOn ? <LuMinimize /> : <LuMaximize />}
    </IconButton>
  );
};

export default MaximizeScreen;
