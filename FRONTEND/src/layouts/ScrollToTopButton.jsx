import React, { useState, useEffect } from 'react';
import { Fab, Zoom, Tooltip } from '@mui/material';
// Puedes cambiar este ícono por otro de los sugeridos abajo
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setVisible(scrollTop > 300);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={visible}>
      <Tooltip title="Desplazar arriba" arrow placement="left">
        <Fab 
          onClick={scrollToTop}
          size="medium"
          aria-label="scroll back to top"
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            zIndex: 1000,
            backgroundColor: "#3f51b5",
            color: "#fff",
            '&:hover': {
              backgroundColor: "#303f9f"
            }
          }}
        >
          <ExpandLessIcon />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ScrollToTopButton;
