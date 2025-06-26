import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Slide } from '@mui/material';
import { useDispatch } from 'react-redux';
import { showAlert } from '../redux/alertSlice';
import { handleFormError } from '../utils/handleFormError';
import { useNavigate } from 'react-router-dom';
import { sentItTicket } from '../services/ticketServices';
// import { sendItSupport } from '../services/supportServices';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FormDialog({ onClose, value }) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [message, setMessage] = React.useState('');

  const handleSubmit = async () => {
    try {
      if (!message.trim()) {
        throw Error('Please Describe Your Issue.');
      }

      await sentItTicket({ message });

      setMessage('');
      onClose();

      dispatch(
        showAlert({
          type: 'success',
          message: 'Mail Sent Successfully!',
        })
      );
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={value}
        TransitionComponent={Transition}
        onClose={onClose}
        PaperProps={{
          component: 'form',
          // onSubmit: (event) => {
          //   event.preventDefault();
          //   const formData = new FormData(event.currentTarget);
          //   const formJson = Object.fromEntries(formData.entries());
          //   const email = formJson.email;
          //   console.log(email);
          //   onClose();
          // },
        }}
      >
        <DialogTitle>Help & Support</DialogTitle>
        <DialogContent>
          <DialogContentText>
            If you have any questions or need assistance, we're here to help.
            Please describe your issue below, and our support team will get back
            to you as soon as possible.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="issue"
            name="issue"
            label="Describe your issue"
            type="text"
            fullWidth
            multiline
            variant="standard"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
