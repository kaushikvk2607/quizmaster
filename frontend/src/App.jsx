// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { blue, orange, grey } from '@mui/material/colors';

// Components
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateQuiz from './components/CreateQuiz';
import EditQuiz from './components/EditQuiz';
import TakeQuiz from './components/TakeQuiz';
import Leaderboard from './components/Leaderboard';
import Analytics from './components/Analytics';
import NotFound from './components/NotFound';

const App = () => {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('light');
  
  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('quizUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Function to handle user login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('quizUser', JSON.stringify(userData));
  };

  // Function to handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('quizUser');
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Create theme based on current mode
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: blue[700],
      },
      secondary: {
        main: orange[700],
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? grey[900] : grey[100],
        secondary: mode === 'light' ? grey[700] : grey[300],
      }
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.8rem',
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0 4px 6px rgba(0,0,0,0.1)' 
              : '0 4px 6px rgba(0,0,0,0.3)',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header 
          user={user} 
          onLogout={handleLogout}
          mode={mode}
          toggleTheme={toggleTheme}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/quizzes" />} />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
          } />
          <Route path="/quizzes" element={<TakeQuiz user={user} />} />
          <Route path="/quizzes/:id" element={<TakeQuiz user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            user ? <Dashboard user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/create-quiz" element={
            user ? <CreateQuiz user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/edit-quiz/:id" element={
            user ? <EditQuiz user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/analytics" element={
            user ? <Analytics user={user} /> : <Navigate to="/login" />
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;