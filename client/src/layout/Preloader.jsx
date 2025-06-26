import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import webaxLogo from '../assets/loader-logo.png';
import { useSelector } from 'react-redux';

const Preloader = () => {
  const { global } = useSelector((state) => state.loading);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let timer;
    if (global === false) {
      setAnimate(true);
      timer = setTimeout(() => setLoading(false), 1500);
    } else {
      setAnimate(false);
      if (!loading) setLoading(true);
    }
    return () => clearTimeout(timer);
  }, [global]);

  return (
    loading && (
      <Box
        className={`preloader ${animate ? 'fade-out' : ''}`}
        role="progressbar"
        aria-busy={loading}
        aria-label="Loading"
      >
        <img src={webaxLogo} alt="Logo" className="logo" />
      </Box>
    )
  );
};

export default Preloader;
