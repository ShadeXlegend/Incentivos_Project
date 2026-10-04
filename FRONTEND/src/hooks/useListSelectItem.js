import { useState } from "react";
const useListSelectItem = () => {
  const [checked, setChecked] = useState([1]);
  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };
  return {
    checked,
    handleToggle
  };
};
export default useListSelectItem;