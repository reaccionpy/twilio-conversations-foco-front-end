import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useField } from "formik";
import React from "react";

/* eslint-disable */

const FormikSelect = ({
  label,
  enableCapitalize = true,
  valueKey,
  optionTitleKey,
  ...props
}: {
  label: string;
  enableCapitalize?: boolean;
  valueKey: string;
  optionTitleKey?: string;
}) => {
  const [field, meta, helpers] = useField(props);
  return (
    <FormControl>
      <InputLabel id={props.id}>{label}</InputLabel>
      <Select
        fullWidth
        {...field}
        {...props}
        onChange={(event) => {
          if (props.onChange) {
            props.onChange(event.target.value);
          } else {
            helpers.setValue(event.target.value);
          }
        }}
        labelId={props.id}
        size={"small"}
        label={label}
        value={field.value ?? "0"}
      >
        {valueKey != null && (
          <MenuItem key={"0"} id={"0"} value={"0"}>
            None
          </MenuItem>
        )}
        {props.options.map((option: { [x: string]: any }, index: number) => {
          const parsedOption =
            optionTitleKey != null ? option[optionTitleKey] : option;

          const parsedValue = valueKey != null ? option[valueKey] : option;

          return (
            <MenuItem key={index} id={index.toString()} value={parsedValue ?? ""}>
              {parsedOption}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText id="outlined-weight-helper-text" error={!!meta.error}>
        {meta.touched && meta.error ? meta.error : null}
      </FormHelperText>
    </FormControl>
  );
};

export default FormikSelect;
