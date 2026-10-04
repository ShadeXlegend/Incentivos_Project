import { Box, FormHelperText, InputLabel, Select } from "@mui/material";
import { Controller } from "react-hook-form";
const SelectInput = ({
  control,
  children,
  id,
  label,
  name,
  helperText,
  containerSx,
  ...other
}) => {
  return <Controller control={control} render={({
    field,
    fieldState
  }) => <Box sx={containerSx}>
          <InputLabel htmlFor={id ?? name} style={{
      fontWeight: "medium"
    }} error={fieldState.error != null}>
            {label}
          </InputLabel>
          <Select size="small" id={id ?? name} {...other} {...field} sx={{
      width: "100%",
      mt: 1,
      "& > .MuiSelect-outlined": {
        py: "10px"
      }
    }} error={fieldState.error != null} inputProps={{
      style: {
        padding: "10px 12px"
      }
    }}>
            {children}
          </Select>
          {(helperText || fieldState.error?.message) && <FormHelperText error={fieldState.error != null}>{fieldState.error?.message ?? helperText}</FormHelperText>}
        </Box>} name={name} />;
};
export default SelectInput;