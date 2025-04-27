// components/NotFound.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
          >
            Go to Homepage
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;