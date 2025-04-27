// components/EditQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getQuiz, updateQuiz } from '../services/quizService';

const QuestionTypes = [
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Multiple Answers' },
  { value: 'true-false', label: 'True/False' }
];

const EditQuiz = ({ user }) => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [tabValue, setTabValue] = useState(0);
  
  // Quiz metadata
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 0,
    randomizeQuestions: false,
    isPublic: true,
    passingScore: 70,
  });
  
  // Quiz questions
  const [questions, setQuestions] = useState([]);
  
  // Fetch quiz data on component mount
  useEffect(() => {
    fetchQuizData();
  }, [id]);
  
  const fetchQuizData = async () => {
    setLoading(true);
    try {
      const quizResponse = await getQuiz(id);
      
      // Validate that the quiz belongs to the current user
      if (quizResponse.createdBy !== user.id) {
        setError('You do not have permission to edit this quiz');
        setLoading(false);
        return;
      }
      
      setQuizData({
        title: quizResponse.title,
        description: quizResponse.description || '',
        timeLimit: quizResponse.timeLimit || 0,
        randomizeQuestions: quizResponse.randomizeQuestions || false,
        isPublic: quizResponse.isPublic !== false, // Default to true if not specified
        passingScore: quizResponse.passingScore || 70,
      });
      
      // Transform questions to include unique IDs for drag and drop
      const formattedQuestions = quizResponse.questions.map(q => ({
        ...q,
        id: q.id || Date.now() + Math.random(),
        options: q.options.map(o => ({
          ...o,
          id: o.id || Date.now() + Math.random(),
        })),
      }));
      
      setQuestions(formattedQuestions);
      setError('');
    } catch (err) {
      setError('Failed to load quiz data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
  
  const handleSaveQuiz = async () => {
    setError('');
    
    // Final validation before submitting
    if (!validateQuizData() || !validateQuestions()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Prepare the quiz data
      const formattedQuiz = {
        id,
        ...quizData,
        createdBy: user.id,
        questions: questions.map(q => ({
          type: q.type,
          text: q.text,
          points: q.points,
          required: q.required,
          options: q.options.map(o => ({
            text: o.text,
            isCorrect: o.isCorrect
          }))
        }))
      };
      
      await updateQuiz(id, formattedQuiz);
      setSnackbar({ open: true, message: 'Quiz updated successfully!' });
    } catch (err) {
      setError(err.message || 'Failed to update quiz. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading quiz data...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Edit Quiz
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Quiz Details" />
          <Tab label="Questions" />
        </Tabs>
      </Paper>
      
      {/* Tab 1: Quiz Details */}
      {tabValue === 0 && (
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
              onClick={handleSaveQuiz}
              disabled={saving || !quizData.title.trim()}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Tab 2: Questions */}
      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Edit Questions
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
                    <Draggable key={question.id.toString()} draggableId={question.id.toString()} index={index}>
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
                                    key={option.id.toString()}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveQuiz}
              disabled={saving || questions.length === 0}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </>
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

export default EditQuiz;