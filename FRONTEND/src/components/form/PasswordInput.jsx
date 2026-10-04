import { Controller } from "react-hook-form";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useToggle } from "../../hooks";

const PasswordInput = ({
  name,
  control,
  label = "Contraseña",
  placeholder = "Escribe tu contraseña",
  ...rest
}) => {
  const { isOpen, toggleOpen } = useToggle();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          type={isOpen ? "text" : "password"}
          label={label}
          placeholder={placeholder}
          fullWidth
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleOpen} edge="end">
                  {isOpen ? <LuEyeOff /> : <LuEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...rest}
        />
      )}
    />
  );
};

export default PasswordInput;
