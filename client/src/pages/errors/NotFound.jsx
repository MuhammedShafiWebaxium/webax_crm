import { Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';
import { stopLoading } from '../../redux/loadingSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const NotFound = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(stopLoading());
  }, []);

  return (
    <Container sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you are looking for doesn’t exist.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Back to Home
      </Button>
    </Container>
  );
};

export default NotFound;
