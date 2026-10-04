/*

 * File Name: ScrollToTop.tsxAuthor: Miguel Ángel Noel García*/
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const ScrollToTop = () => {
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [pathname]);
  return null;
};
export default ScrollToTop;