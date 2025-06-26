import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const CheckboxLabels = ({ label, checked, onChange, name }) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={onChange}
            name={name}
          />
        }
        label={label}
      />
    </FormGroup>
  );
};

export default CheckboxLabels;
