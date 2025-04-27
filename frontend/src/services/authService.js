import api from './api';

// For demo purposes, mock authentication
const USERS_KEY = 'quiz_app_users';
const CURRENT_USER_ID = 'quiz_app_current_user';

// Helper to get users from localStorage
const getUsers = () => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Register a new user
export const register = async (userData) => {
  // In a real app, this would make an API call
  // api.post('/auth/register', userData);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In a real app, NEVER store plaintext passwords
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    // Save to "database"
    users.push(newUser);
    saveUsers(users);
    
    // Save current user ID
    localStorage.setItem(CURRENT_USER_ID, newUser.id);
    
    // Return user data (without password)
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Login a user
export const login = async (credentials) => {
  // In a real app, this would make an API call
  // api.post('/auth/login', credentials);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsers();
    
    // Find user by email
    const user = users.find(u => u.email === credentials.email);
    
    // Check if user exists and password matches
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }
    
    // Save current user ID
    localStorage.setItem(CURRENT_USER_ID, user.id);
    
    // Return user data (without password)
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Logout a user
export const logout = () => {
  // In a real app, this would make an API call
  // api.post('/auth/logout');
  
  // Remove current user ID
  localStorage.removeItem(CURRENT_USER_ID);
  return true;
};

// Get the current logged-in user
export const getCurrentUser = () => {
  // In a real app, this would make an API call
  // api.get('/auth/me');
  
  const userId = localStorage.getItem(CURRENT_USER_ID);
  
  if (!userId) {
    return null;
  }
  
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return null;
  }
  
  // Return user data (without password)
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Initialize with a default admin user if no users exist
export const initializeAuthService = () => {
  const users = getUsers();
  
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];
    
    saveUsers(defaultUsers);
  }
};

// Initialize on import
initializeAuthService();