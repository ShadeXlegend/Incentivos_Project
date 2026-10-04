import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller } from "react-hook-form";
const CheckboxInput = ({
  control,
  id,
  name,
  label,
  labelSx,
  ...other
}) => {
  return <Controller control={control} render={({
    field,
    fieldState
  }) => <FormControlLabel control={<Checkbox id={id ?? name} {...other} {...field} />} sx={labelSx} label={label} />} name={name} />;
};
export default CheckboxInput;