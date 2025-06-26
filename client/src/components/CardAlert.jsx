import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FormDialog from './Dialog';

export default function CardAlert() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card variant="outlined" sx={{ m: 1.5, p: 1.5, minHeight: '190px'}}>
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          Need Assistance?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Having trouble? Our team is ready to assist. Reach out anytime!
        </Typography>
        <Button variant="contained" size="small" fullWidth onClick={handleClickOpen}>
          Get Support
        </Button>
        <FormDialog onClose={handleClose} value={open}/>
      </CardContent>
    </Card>
  );
}
