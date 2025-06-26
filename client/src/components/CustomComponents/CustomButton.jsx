import { Box, Button } from '@mui/material';

const CustomButton = ({ sx, name, fullWidth, onClick, loading }) => {
  return (
    <Box sx={sx}>
      <Button
        variant="contained"
        size="small"
        fullWidth={fullWidth}
        onClick={onClick}
        loading={loading}
      >
        {name}
      </Button>
    </Box>
  );
};

export default CustomButton;
