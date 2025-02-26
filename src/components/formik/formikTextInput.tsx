import { useField } from "formik";
import React from "react";
import TextField from "@mui/material/TextField";

// @ts-ignore
const FormikTextInput = ({ label, hidden = false, ...props }) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input>. We can use field meta to show an error
  // message if the field is invalid and it has been touched (i.e. visited)
  // @ts-ignore
  const [field, meta, helpers] = useField(props);
  return (
    <TextField
      error={meta.touched && !!meta.error}
      {...field}
      {...props}
      onChange={(event) => {
        if (props.onChange != null) {
          props.onChange();
        }
        helpers.setValue(event.target.value);
      }}
      label={label}
      helperText={meta.touched && meta.error ? meta.error : null}
      type={hidden ? "password" : props.type}
    />
  );
};

export default FormikTextInput;
