import { useState } from "react";
const useTabsChange = () => {
  const [value, setValue] = useState(1);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return {
    value,
    handleChange
  };
};
export default useTabsChange;