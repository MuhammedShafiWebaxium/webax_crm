import { Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';
import { stopLoading } from '../../redux/loadingSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const ServerError = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(stopLoading());
  }, []);
  return (
    <Container sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        500 - Server Error
      </Typography>
      <Typography variant="body1" paragraph>
        Oops! Something went wrong. Please try again later.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Back to Home
      </Button>
    </Container>
  );
};

export default ServerError;
