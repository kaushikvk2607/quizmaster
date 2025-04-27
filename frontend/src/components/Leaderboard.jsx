// components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  EmojiEvents as TrophyIcon,
  FormatListNumbered as ListIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getLeaderboard, getQuizzes } from '../services/quizService';

// Helper function to sort data
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const Leaderboard = () => {
  const theme = useTheme();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuizId = queryParams.get('quizId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(initialQuizId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting and pagination
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('score');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    fetchQuizzes();
    fetchLeaderboardData(selectedQuizId);
  }, []);
  
  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzes();
      setQuizzes(data.filter(q => q.isPublic !== false));
    } catch (err) {
      console.error('Failed to load quizzes', err);
    }
  };
  
  const fetchLeaderboardData = async (quizId) => {
    setLoading(true);
    try {
      const data = await getLeaderboard(quizId === 'all' ? null : quizId);
      setLeaderboardData(data);
      setError('');
    } catch (err) {
      setError('Failed to load leaderboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuizChange = (event) => {
    const quizId = event.target.value;
    setSelectedQuizId(quizId);
    setPage(0); // Reset to first page when changing quiz
    fetchLeaderboardData(quizId);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter and sort data
  const filteredData = leaderboardData.filter(entry => {
    return entry.userName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const sortedData = stableSort(filteredData, getComparator(order, orderBy));
  
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Leaderboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Select Quiz"
            value={selectedQuizId}
            onChange={handleQuizChange}
            sx={{ minWidth: 200 }}
            variant="outlined"
            SelectProps={{
              MenuProps: { disableScrollLock: true }
            }}
          >
            <MenuItem value="all">All Quizzes</MenuItem>
            {quizzes.map((quiz) => (
              <MenuItem key={quiz.id} value={quiz.id}>
                {quiz.title}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Search by name"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Alert severity="info">
            No leaderboard data found. Be the first to take this quiz!
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table aria-label="leaderboard table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Rank</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'quizTitle'}
                        direction={orderBy === 'quizTitle' ? order : 'asc'}
                        onClick={() => handleRequestSort('quizTitle')}
                      >
                        Quiz
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === 'score'}
                        direction={orderBy === 'score' ? order : 'desc'}
                        onClick={() => handleRequestSort('score')}
                      >
                        Score
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === 'timeTaken'}
                        direction={orderBy === 'timeTaken' ? order : 'asc'}
                        onClick={() => handleRequestSort('timeTaken')}
                      >
                        Time
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <TableSortLabel
                        active={orderBy === 'attemptDate'}
                        direction={orderBy === 'attemptDate' ? order : 'desc'}
                        onClick={() => handleRequestSort('attemptDate')}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((entry, index) => {
                    const rank = page * rowsPerPage + index + 1;
                    
                    return (
                      <TableRow
                        key={entry.id}
                        hover
                        sx={{
                          backgroundColor: rank <= 3 ? `${theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 215, 0, 0.1)'}` : 'inherit',
                          '&:nth-of-type(odd)': {
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? rank <= 3 ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                              : rank <= 3 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)'
                          },
                        }}
                      >
                        <TableCell align="center">
                          {rank <= 3 ? (
                            <Chip
                              icon={<TrophyIcon />}
                              label={rank}
                              color={
                                rank === 1 ? 'warning' : 
                                rank === 2 ? 'primary' : 
                                'secondary'
                              }
                              variant="filled"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label={rank}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={entry.userAvatar} 
                              alt={entry.userName}
                              sx={{ width: 30, height: 30, mr: 1 }}
                            >
                              {entry.userName.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {entry.userName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {entry.quizTitle}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'bold',
                              color: entry.passed 
                                ? theme.palette.success.main 
                                : theme.palette.error.main
                            }}
                          >
                            {entry.score}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {entry.timeTaken ? (
                            <Typography variant="body2">
                              {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              --
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {new Date(entry.attemptDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Leaderboard;