import { useCallback, useState } from "react";
const useToggle = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const show = useCallback(() => setIsOpen(true), []);
  const hide = useCallback(() => setIsOpen(false), []);
  const toggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  return {
    isOpen,
    toggleOpen,
    show,
    hide
  };
};
export default useToggle;