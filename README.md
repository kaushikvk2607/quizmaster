# Online Quiz Platform

## Overview
This project is a comprehensive online quiz platform that allows users to create, share, and take quizzes. It features a modern and responsive UI with Material UI, theme switching functionality, and a full-featured backend using Express.js and MongoDB.

## Features Implemented

### User Authentication
- User registration and login with JWT authentication
- Password hashing with bcrypt
- Role-based access control (user and admin roles)
- Protected routes for authenticated users

### Quiz Creation and Management
- Create quizzes with multiple question types (multiple choice, checkbox, true/false)
- Edit and update existing quizzes
- Delete quizzes
- Duplicate quizzes
- Share quizzes with others
- Set time limits, passing scores, and randomization options

### Quiz Taking
- Take public quizzes as authenticated or anonymous users
- Timed quizzes with countdown timer
- Progress tracking during quiz taking
- Immediate results and feedback after submission
- Responsive design for all screen sizes

### Analytics and Statistics
- Detailed analytics for quiz creators
- Performance metrics (total attempts, average score, pass rate)
- Time analysis
- Question-level analysis to identify difficult questions
- Data visualization with charts and graphs

### Leaderboard
- Global leaderboard for all quizzes
- Quiz-specific leaderboards
- Sorting and filtering options
- Pagination for better performance

## Technical Stack

### Frontend
- **React**: Modern UI library for building the user interface
- **Material UI**: Component library for consistent and attractive design
- **React Router**: Navigation and routing
- **Recharts**: Data visualization library for analytics
- **Axios**: HTTP client for API communication
- **React Beautiful DnD**: Drag and drop functionality for quiz creation
- **JWT-Decode**: Decoding JWT tokens for authentication

### Backend
- **Express.js**: Web server framework
- **MongoDB/Mongoose**: Database and ODM for data storage
- **JWT**: Authentication and authorization
- **bcrypt**: Password hashing
- **Express Validator**: Input validation
- **CORS**: Cross-origin resource sharing

## Application Structure

### Frontend Components
- Authentication (Login/Register)
- Dashboard for quiz management
- Quiz Creator with drag-and-drop functionality
- Quiz Editor for updating existing quizzes
- Quiz Taking interface with timer
- Leaderboard with sorting and filtering
- Analytics dashboard with charts and visualizations
- Responsive header with theme switching

### Backend Structure
- RESTful API endpoints for all features
- User authentication middleware
- Data models (User, Quiz, Attempt)
- Controllers for business logic
- Routes for API endpoints

## How to Run the Project

### Backend
1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies: `npm install`
4. Create a `.env` file with your MongoDB URI and JWT secret
5. Start the server: `npm run server`

### Frontend
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Access the application at http://localhost:3000

## Future Enhancements
- Social login options (Google, Facebook)
- More question types (fill-in-the-blank, matching, ordering)
- Quiz categories and tags
- Search functionality
- File upload support for questions (images, audio)
- User profile customization
- Pagination for quiz listings
- Export results to CSV/PDF
- Email notifications
- Mobile applications

## Conclusion
This online quiz platform provides a complete solution for creating, managing, and taking quizzes, with a focus on user experience, analytics, and performance. It demonstrates modern web development practices with React and Express.js, along with best practices for security and scalability.