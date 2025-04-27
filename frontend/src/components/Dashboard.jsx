// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Paper,
  Alert,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as AnalyticsIcon,
  ContentCopy as DuplicateIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { getUserQuizzes, deleteQuiz, duplicateQuiz } from '../services/quizService';

const Dashboard = ({ user }) => {
  const theme = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  useEffect(() => {
    fetchQuizzes();
  }, [user]);
  
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getUserQuizzes(user.id);
      setQuizzes(data);
      setError('');
    } catch (err) {
      setError('Failed to load your quizzes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteQuiz(quizToDelete.id);
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
      setSnackbar({ open: true, message: 'Quiz deleted successfully' });
    } catch (err) {
      setError('Failed to delete the quiz. Please try again.');
      console.error(err);
    }
  };
  
  const handleDuplicateQuiz = async (quizId) => {
    try {
      const newQuiz = await duplicateQuiz(quizId);
      setQuizzes([...quizzes, newQuiz]);
      setSnackbar({ open: true, message: 'Quiz duplicated successfully' });
    } catch (err) {
      setError('Failed to duplicate the quiz. Please try again.');
      console.error(err);
    }
  };
  
  const handleShareQuiz = (quiz) => {
    // Copy quiz link to clipboard
    const quizLink = `${window.location.origin}/quizzes/${quiz.id}`;
    navigator.clipboard.writeText(quizLink);
    setSnackbar({ open: true, message: 'Quiz link copied to clipboard' });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Quizzes
        </Typography>
        <Button
          component={RouterLink}
          to="/create-quiz"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Create New Quiz
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            You haven't created any quizzes yet
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Get started by creating your first quiz!
          </Typography>
          <Button
            component={RouterLink}
            to="/create-quiz"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create New Quiz
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[6]
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {quiz.description || 'No description provided'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    <Chip 
                      size="small" 
                      label={`${quiz.questions.length} Questions`} 
                    />
                    <Chip 
                      size="small" 
                      label={quiz.isPublic ? 'Public' : 'Private'} 
                      color={quiz.isPublic ? 'success' : 'default'}
                    />
                    {quiz.attempts > 0 && (
                      <Chip 
                        size="small" 
                        label={`${quiz.attempts} Attempts`} 
                        color="primary"
                      />
                    )}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Button
                      component={RouterLink}
                      to={`/edit-quiz/${quiz.id}`}
                      size="small"
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      aria-label="delete quiz"
                      onClick={() => handleDeleteClick(quiz)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      aria-label="duplicate quiz"
                      onClick={() => handleDuplicateQuiz(quiz.id)}
                      color="primary"
                    >
                      <DuplicateIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="share quiz"
                      onClick={() => handleShareQuiz(quiz)}
                      color="primary"
                    >
                      <ShareIcon />
                    </IconButton>
                    <Button
                      component={RouterLink}
                      to={`/analytics?quizId=${quiz.id}`}
                      size="small"
                      startIcon={<AnalyticsIcon />}
                      color="secondary"
                    >
                      Analytics
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone, and all associated data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Dashboard;