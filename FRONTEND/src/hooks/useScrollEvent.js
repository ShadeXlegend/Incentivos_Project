import { useEffect, useState } from "react";
const useScrollEvent = () => {
  const [scrollPassed, setScrollPassed] = useState(0);
  const handleScroll = () => setScrollPassed((window.scrollY + window.innerHeight) * 100 / document.body.offsetHeight);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return {
    scrollPassed,
    scrollY: window.scrollY,
    scrollHeight: document.body.offsetHeight
  };
};
export default useScrollEvent;