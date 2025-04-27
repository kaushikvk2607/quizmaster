// components/CreateQuiz.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { createQuiz } from '../services/quizService';

const QuestionTypes = [
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Multiple Answers' },
  { value: 'true-false', label: 'True/False' }
];

const CreateQuiz = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Quiz metadata
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 0, // 0 means no time limit
    randomizeQuestions: false,
    isPublic: true,
    passingScore: 70,
  });
  
  // Quiz questions
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      type: 'multiple',
      text: '',
      points: 1,
      options: [
        { id: Date.now() + 1, text: '', isCorrect: false },
        { id: Date.now() + 2, text: '', isCorrect: false },
      ],
      required: true,
    },
  ]);
  
  const handleQuizDataChange = (e) => {
    const { name, value, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: name === 'randomizeQuestions' || name === 'isPublic' ? checked : value,
    });
  };
  
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'multiple',
      text: '',
      points: 1,
      options: [
        { id: Date.now() + 1, text: '', isCorrect: false },
        { id: Date.now() + 2, text: '', isCorrect: false },
      ],
      required: true,
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  const removeQuestion = (questionId) => {
    if (questions.length === 1) {
      setSnackbar({ open: true, message: 'You need at least one question' });
      return;
    }
    setQuestions(questions.filter(q => q.id !== questionId));
  };
  
  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          if (field === 'type' && value === 'true-false') {
            return {
              ...q,
              [field]: value,
              options: [
                { id: Date.now() + 1, text: 'True', isCorrect: false },
                { id: Date.now() + 2, text: 'False', isCorrect: false },
              ],
            };
          }
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };
  
  const addOption = (questionId) => {
    const newOption = {
      id: Date.now(),
      text: '',
      isCorrect: false,
    };
    
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, newOption],
          };
        }
        return q;
      })
    );
  };
  
  const removeOption = (questionId, optionId) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          if (q.options.length <= 2) {
            setSnackbar({ open: true, message: 'A question needs at least two options' });
            return q;
          }
          return {
            ...q,
            options: q.options.filter(o => o.id !== optionId),
          };
        }
        return q;
      })
    );
  };
  
  const handleOptionChange = (questionId, optionId, field, value) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const isSingleAnswer = q.type === 'multiple' || q.type === 'true-false';
          
          return {
            ...q,
            options: q.options.map(o => {
              // For single answer types, uncheck other options when one is checked
              if (field === 'isCorrect' && value === true && isSingleAnswer && o.id !== optionId) {
                return { ...o, isCorrect: false };
              }
              
              if (o.id === optionId) {
                return { ...o, [field]: value };
              }
              return o;
            }),
          };
        }
        return q;
      })
    );
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setQuestions(items);
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const validateQuizData = () => {
    if (!quizData.title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    
    return true;
  };
  
  const validateQuestions = () => {
    // Check if all questions have text
    const emptyQuestions = questions.filter(q => !q.text.trim());
    if (emptyQuestions.length > 0) {
      setError('All questions must have text');
      return false;
    }
    
    // Check if all questions have at least one correct answer
    const noCorrectAnswer = questions.filter(q => 
      !q.options.some(o => o.isCorrect)
    );
    if (noCorrectAnswer.length > 0) {
      setError('Each question must have at least one correct answer');
      return false;
    }
    
    // Check if all options have text
    const emptyOptions = questions.filter(q => 
      q.options.some(o => !o.text.trim())
    );
    if (emptyOptions.length > 0) {
      setError('All answer options must have text');
      return false;
    }
    
    return true;
  };
  
  const handleCreateQuiz = async () => {
    setError('');
    
    // Final validation before submitting
    if (!validateQuizData() || !validateQuestions()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the quiz data
      const formattedQuiz = {
        ...quizData,
        createdBy: user.id,
        questions: questions.map(q => ({
          type: q.type,
          text: q.text,
          points: q.points,
          required: q.required,
          options: q.options
        }))
      };
      
      const newQuiz = await createQuiz(formattedQuiz);
      setSnackbar({ open: true, message: 'Quiz created successfully!' });
      
      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Stepper steps
  const steps = ['Quiz Details', 'Create Questions', 'Review & Finish'];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Step 1: Quiz Details */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Quiz Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Quiz Title"
                name="title"
                value={quizData.title}
                onChange={handleQuizDataChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={quizData.description}
                onChange={handleQuizDataChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Provide a brief description of your quiz"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time Limit (minutes, 0 for no limit)"
                name="timeLimit"
                type="number"
                value={quizData.timeLimit}
                onChange={handleQuizDataChange}
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Passing Score (%)"
                name="passingScore"
                type="number"
                value={quizData.passingScore}
                onChange={handleQuizDataChange}
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={quizData.randomizeQuestions}
                    onChange={handleQuizDataChange}
                    name="randomizeQuestions"
                    color="primary"
                  />
                }
                label="Randomize Question Order"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={quizData.isPublic}
                    onChange={handleQuizDataChange}
                    name="isPublic"
                    color="primary"
                  />
                }
                label="Make Quiz Public"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!quizData.title.trim()}
            >
              Next
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Step 2: Create Questions */}
      {activeStep === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Create Questions
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </Box>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ mb: 3, position: 'relative' }}
                        >
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              bgcolor: 'background.default',
                              borderTopLeftRadius: 'inherit',
                              borderTopRightRadius: 'inherit',
                            }}
                          >
                            <DragHandleIcon color="action" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              Question {index + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeQuestion(question.id)}
                              sx={{ ml: 'auto' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item xs={12}>
                                <TextField
                                  label="Question Text"
                                  value={question.text}
                                  onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  multiline
                                  rows={2}
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  select
                                  label="Question Type"
                                  value={question.type}
                                  onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                                  fullWidth
                                  variant="outlined"
                                >
                                  {QuestionTypes.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Points"
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => handleQuestionChange(
                                    question.id, 
                                    'points', 
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )}
                                  fullWidth
                                  variant="outlined"
                                  InputProps={{ inputProps: { min: 1 } }}
                                />
                              </Grid>
                              
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Answer Options
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                {question.options.map((option, optIndex) => (
                                  <Box
                                    key={option.id}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: 2,
                                      gap: 1
                                    }}
                                  >
                                    <FormControlLabel
                                      control={
                                        question.type === 'checkbox' ? (
                                          <Switch
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(
                                              question.id,
                                              option.id,
                                              'isCorrect',
                                              e.target.checked
                                            )}
                                            color="primary"
                                            size="small"
                                          />
                                        ) : (
                                          <Switch
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(
                                              question.id,
                                              option.id,
                                              'isCorrect',
                                              e.target.checked
                                            )}
                                            color="primary"
                                            size="small"
                                            name={`question-${question.id}-option`}
                                          />
                                        )
                                      }
                                      label=""
                                    />
                                    
                                    <TextField
                                      label={`Option ${optIndex + 1}`}
                                      value={option.text}
                                      onChange={(e) => handleOptionChange(
                                        question.id,
                                        option.id,
                                        'text',
                                        e.target.value
                                      )}
                                      fullWidth
                                      required
                                      variant="outlined"
                                      disabled={question.type === 'true-false'}
                                    />
                                    
                                    {question.type !== 'true-false' && (
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => removeOption(question.id, option.id)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    )}
                                  </Box>
                                ))}
                                
                                {question.type !== 'true-false' && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => addOption(question.id)}
                                  >
                                    Add Option
                                  </Button>
                                )}
                              </Grid>
                              
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={question.required}
                                      onChange={(e) => handleQuestionChange(
                                        question.id,
                                        'required',
                                        e.target.checked
                                      )}
                                      color="primary"
                                    />
                                  }
                                  label="Required Question"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={questions.length === 0}
            >
              Next
            </Button>
          </Box>
        </>
      )}
      
      {/* Step 3: Review & Finish */}
      {activeStep === 2 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Review Quiz
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Title:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {quizData.title}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Time Limit:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {quizData.timeLimit > 0 ? `${quizData.timeLimit} minutes` : 'No time limit'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {quizData.description || 'No description provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Visibility:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {quizData.isPublic ? 'Public' : 'Private'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Question Order:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {quizData.randomizeQuestions ? 'Randomized' : 'Fixed'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Passing Score:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {quizData.passingScore}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Total Questions:</Typography>
                <Typography variant="body1" color="textSecondary">
                  {questions.length}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Questions Summary
          </Typography>
          {questions.map((question, index) => (
            <Box key={question.id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                {index + 1}. {question.text}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {QuestionTypes.find(t => t.value === question.type)?.label || 'Multiple Choice'} - {question.points} {question.points === 1 ? 'point' : 'points'}
              </Typography>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateQuiz}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>
          </Box>
        </Paper>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default CreateQuiz;