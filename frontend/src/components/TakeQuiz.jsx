// components/TakeQuiz.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormGroup,
  Checkbox,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  Divider,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  CheckCircle as CompleteIcon,
  Timer as TimerIcon,
  Flag as FlagIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { getQuizzes, getQuiz, submitQuizAttempt } from '../services/quizService';

const TakeQuiz = ({ user }) => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  
  // Fetch quiz list or a specific quiz based on the URL parameter
  useEffect(() => {
    if (id) {
      fetchSingleQuiz(id);
    } else {
      fetchQuizList();
    }
  }, [id]);
  
  // Timer effect for timed quizzes
  useEffect(() => {
    let timer;
    if (quizStarted && quiz && quiz.timeLimit > 0 && timeLeft !== null) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
      } else {
        handleSubmitQuiz();
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quizStarted, timeLeft, quiz]);
  
  const fetchQuizList = async () => {
    setLoading(true);
    try {
      const data = await getQuizzes();
      setQuizzes(data.filter(q => q.isPublic !== false));
      setError('');
    } catch (err) {
      setError('Failed to load quizzes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSingleQuiz = async (quizId) => {
    setLoading(true);
    try {
      const quizData = await getQuiz(quizId);
      
      // Check if quiz is public or belongs to the current user
      if (!quizData.isPublic && (!user || quizData.createdBy !== user.id)) {
        setError('This quiz is private');
        setLoading(false);
        return;
      }
      
      // If the quiz has randomized questions, shuffle them
      if (quizData.randomizeQuestions) {
        quizData.questions = [...quizData.questions].sort(() => Math.random() - 0.5);
      }
      
      setQuiz(quizData);
      
      // Initialize answers object
      const initialAnswers = {};
      quizData.questions.forEach(q => {
        initialAnswers[q.id] = q.type === 'checkbox' ? [] : '';
      });
      setAnswers(initialAnswers);
      
      // Set time limit if present
      if (quizData.timeLimit > 0) {
        setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
  };
  
  const handleAnswerChange = (questionId, value, checked = null) => {
    if (checked !== null) {
      // For checkboxes (multiple answers)
      setAnswers(prev => {
        const currentAnswers = [...(prev[questionId] || [])];
        
        if (checked) {
          if (!currentAnswers.includes(value)) {
            return { ...prev, [questionId]: [...currentAnswers, value] };
          }
        } else {
          return { 
            ...prev, 
            [questionId]: currentAnswers.filter(answer => answer !== value) 
          };
        }
        
        return prev;
      });
    } else {
      // For radio buttons (single answer)
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleOpenSubmitDialog = () => {
    setConfirmSubmitOpen(true);
  };
  
  const handleCloseSubmitDialog = () => {
    setConfirmSubmitOpen(false);
  };
  
  const handleSubmitQuiz = async () => {
    setConfirmSubmitOpen(false);
    setLoading(true);
    
    try {
      // Check if all required questions are answered
      const unansweredRequired = quiz.questions
        .filter(q => q.required)
        .filter(q => {
          const answer = answers[q.id];
          if (q.type === 'checkbox') {
            return !answer || answer.length === 0;
          }
          return !answer;
        });
      
      if (unansweredRequired.length > 0) {
        setError(`Please answer all required questions before submitting.`);
        setActiveStep(quiz.questions.findIndex(q => q.id === unansweredRequired[0].id));
        setLoading(false);
        return;
      }
      
      // Prepare submission data
      const submission = {
        quizId: quiz.id,
        userId: user ? user.id : null,
        answers: answers,
        timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60) - timeLeft : null,
      };
      
      const result = await submitQuizAttempt(submission);
      setResults(result);
      setQuizSubmitted(true);
      
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Quiz list view
  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Quizzes
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : quizzes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">
              No quizzes available
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Check back later for new quizzes
            </Typography>
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
                    boxShadow: theme.shadows[4]
                  }
                }}>
                  <CardActionArea 
                    component={RouterLink}
                    to={`/quizzes/${quiz.id}`}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {quiz.description || 'Take this quiz to test your knowledge'}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          size="small" 
                          icon={<HelpIcon />} 
                          label={`${quiz.questions.length} Questions`} 
                        />
                        {quiz.timeLimit > 0 && (
                          <Chip 
                            size="small" 
                            icon={<TimerIcon />} 
                            label={`${quiz.timeLimit} min`} 
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      {quiz.attempts || 0} attempts
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      component={RouterLink}
                      to={`/quizzes/${quiz.id}`}
                    >
                      Take Quiz
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  }
  
  // Loading state
  if (loading && !quiz) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading quiz...
        </Typography>
      </Container>
    );
  }
  
  // Error state
  if (error && !quiz) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          component={RouterLink}
          to="/quizzes"
          variant="outlined"
        >
          Back to Quizzes
        </Button>
      </Container>
    );
  }
  
  // Quiz not found
  if (!quiz) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Quiz not found
        </Alert>
        <Button
          startIcon={<BackIcon />}
          component={RouterLink}
          to="/quizzes"
          variant="outlined"
        >
          Back to Quizzes
        </Button>
      </Container>
    );
  }
  
  // Quiz intro screen (before starting)
  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {quiz.title}
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="body1" paragraph>
              {quiz.description || 'Take this quiz to test your knowledge.'}
            </Typography>
            
            <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip
                icon={<HelpIcon />}
                label={`${quiz.questions.length} Questions`}
                color="primary"
                variant="outlined"
              />
              {quiz.timeLimit > 0 && (
                <Chip
                  icon={<TimerIcon />}
                  label={`${quiz.timeLimit} minute time limit`}
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                icon={<FlagIcon />}
                label={`Passing score: ${quiz.passingScore}%`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Instructions:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Read each question carefully before answering
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Questions marked with * are required
            </Typography>
            {quiz.timeLimit > 0 && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                • You have {quiz.timeLimit} minutes to complete this quiz
              </Typography>
            )}
            <Typography variant="body2" sx={{ mb: 1 }}>
              • You need to score at least {quiz.passingScore}% to pass
            </Typography>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<BackIcon />}
              component={RouterLink}
              to="/quizzes"
              variant="outlined"
            >
              Back to Quizzes
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartQuiz}
              endIcon={<NextIcon />}
            >
              Start Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Quiz results after submission
  if (quizSubmitted && results) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quiz Results
          </Typography>
          
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h2" component="div" color={results.passed ? 'success.main' : 'error.main'}>
              {results.score}%
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {results.correctAnswers} out of {results.totalQuestions} correct
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {results.passed ? (
                <Chip
                  icon={<CompleteIcon />}
                  label="Passed"
                  color="success"
                  variant="filled"
                  sx={{ px: 2, py: 1, fontSize: '1rem' }}
                />
              ) : (
                <Chip
                  label="Failed"
                  color="error"
                  variant="filled"
                  sx={{ px: 2, py: 1, fontSize: '1rem' }}
                />
              )}
            </Box>
            
            {quiz.timeLimit > 0 && results.timeTaken && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Time taken: {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Question Details:
          </Typography>
          
          {quiz.questions.map((question, index) => (
            <Card key={question.id} sx={{ mb: 2, bgcolor: results.questionResults[question.id].correct ? 'success.50' : 'error.50' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {index + 1}. {question.text}
                </Typography>
                
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Your answer: {
                      question.type === 'checkbox' 
                        ? results.userAnswers[question.id].join(', ') || 'No answer'
                        : results.userAnswers[question.id] || 'No answer'
                    }
                  </Typography>
                  
                  <Typography variant="body2" color={results.questionResults[question.id].correct ? 'success.main' : 'error.main'}>
                    Correct answer: {
                      question.options
                        .filter(opt => opt.isCorrect)
                        .map(opt => opt.text)
                        .join(', ')
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<BackIcon />}
              component={RouterLink}
              to="/quizzes"
              variant="outlined"
            >
              All Quizzes
            </Button>
            {!results.passed && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Active quiz taking interface
  const currentQuestion = quiz.questions[activeStep];
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {quiz.title}
          </Typography>
          
          {quiz.timeLimit > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon color={timeLeft < 60 ? 'error' : 'action'} sx={{ mr: 1 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontWeight: 'bold',
                  color: timeLeft < 60 ? 'error.main' : 'text.primary'
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          )}
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={(activeStep / quiz.questions.length) * 100} 
          sx={{ mt: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body2" color="textSecondary">
            Question {activeStep + 1} of {quiz.questions.length}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {Math.round((activeStep / quiz.questions.length) * 100)}% complete
          </Typography>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {currentQuestion.required && <span style={{ color: theme.palette.error.main }}>*</span>} {currentQuestion.text}
          </Typography>
          
          {currentQuestion.type === 'multiple' || currentQuestion.type === 'true-false' ? (
            <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.text}
                    control={<Radio />}
                    label={option.text}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ) : (
            <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
              <FormGroup>
                {currentQuestion.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        checked={answers[currentQuestion.id]?.includes(option.text) || false}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, option.text, e.target.checked)}
                      />
                    }
                    label={option.text}
                    sx={{ mb: 1 }}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}
          
          {currentQuestion.required && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              * This question is required
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Previous
          </Button>
          
          {activeStep === quiz.questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenSubmitDialog}
              disabled={currentQuestion.required && !answers[currentQuestion.id]}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<NextIcon />}
              disabled={currentQuestion.required && !answers[currentQuestion.id]}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Submit Confirmation Dialog */}
      <Dialog
        open={confirmSubmitOpen}
        onClose={handleCloseSubmitDialog}
      >
        <DialogTitle>Submit Quiz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubmitDialog}>Cancel</Button>
          <Button onClick={handleSubmitQuiz} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default TakeQuiz;