import { useEffect, useRef, useState } from "react";
const useProgressValue = () => {
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(10);
  const progressRef = useRef(() => {});
  useEffect(() => {
    progressRef.current = () => {
      if (progress > 100) {
        setProgress(0);
        setBuffer(10);
      } else {
        const diff = Math.random() * 10;
        const diff2 = Math.random() * 10;
        setProgress(progress + diff);
        setBuffer(progress + diff + diff2);
      }
    };
  });
  useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current();
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return {
    progress,
    buffer
  };
};
export default useProgressValue;