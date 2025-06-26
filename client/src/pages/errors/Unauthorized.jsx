import { Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';
import { stopLoading } from '../../redux/loadingSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const Unauthorized = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(stopLoading());
  }, []);
  return (
    <Container sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        403 - Unauthorized
      </Typography>
      <Typography variant="body1" paragraph>
        You don’t have permission to access this page.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Go to Dashboard
      </Button>
    </Container>
  );
};

export default Unauthorized;
