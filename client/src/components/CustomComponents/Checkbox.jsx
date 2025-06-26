import { Checkbox } from '@mui/material';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const CustomCheckbox = ({ size = 'small' }) => {
  return <Checkbox {...label} size={size} />;
};

export default CustomCheckbox;
