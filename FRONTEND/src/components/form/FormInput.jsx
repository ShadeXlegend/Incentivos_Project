import { Box, FormHelperText, InputLabel, OutlinedInput } from "@mui/material";
import { Controller } from "react-hook-form";
const FormInput = ({
  control,
  id,
  label,
  name,
  helperText,
  containerSx,
  ...other
}) => {
  return <Controller control={control} defaultValue={""} render={({
    field,
    fieldState
  }) => <Box sx={containerSx}>
          <InputLabel htmlFor={id ?? name} style={{
      fontWeight: "medium"
    }} error={fieldState.error != null}>
            {label}
          </InputLabel>
          <OutlinedInput id={id ?? name} {...other} {...field} sx={{
      width: "100%",
      mt: 1
    }} error={fieldState.error != null} inputProps={{
      style: {
        padding: "10px 12px"
      }
    }} />
          {(helperText || fieldState.error?.message) && <FormHelperText error={fieldState.error != null}>{fieldState.error?.message ?? helperText}</FormHelperText>}
        </Box>} name={name} />;
};
export default FormInput;