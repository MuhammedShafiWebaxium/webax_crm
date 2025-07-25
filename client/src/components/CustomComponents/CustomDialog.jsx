import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CustomDialog({
  open,
  handleClose,
  title,
  content,
  onClick,
}) {
  return (
    <Dialog
      open={open}
      slots={{ transition: Transition }}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{
        '& .MuiPaper-root': {
          maxWidth: '600px', // Adjust width as needed
          maxHeight: '80vh', // Prevents excessive height
          overflow: 'auto', // Ensure no content spills out
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ overflow: 'visible' }}>{content}</DialogContent>
      {onClick && (
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={onClick}>Agree</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
