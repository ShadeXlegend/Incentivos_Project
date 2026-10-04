import { useState, useEffect } from "react";
const useViewPort = () => {
  const [width, setWidth] = useState(window.outerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  useEffect(() => {
    const handleWindowResize = () => {
      setWidth(window.outerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);
  return {
    width,
    height
  };
};
export default useViewPort;