# Task Management API

## Project Summary

I built this backend as part of a full-stack assignment to create a secure and scalable task management system using Node.js, Express, MongoDB, and JWT authentication.

### What I implemented

- User registration and login
- Secure password validation
- JWT-based authentication and logout support
- Role-based access control for Admin, Manager, and User
- Task creation, reading, updating, deleting, and assignment
- Task filtering, search, pagination, and analytics
- OpenAPI documentation for API reference
- Basic real-time task event support using Socket.IO

### Technologies used

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- Express Validator
- Helmet + CORS + Rate Limiting
- Socket.IO

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/todoapp
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1d
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## API Highlights

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Logout: `POST /api/auth/logout`
- Profile: `GET /api/auth/profile`
- Create task: `POST /api/task/createtask`
- List tasks: `GET /api/task/alltasks`
- Assign task: `PATCH /api/task/:id/assign`
- Analytics: `GET /api/task/analytics`
- Docs: `GET /api/docs`

## Notes

- Managers can assign tasks only within their team.
- Users can manage their own tasks.
- Admins have full access to user and task management.

## Summary

This project demonstrates backend development skills including authentication, authorization, database modeling, REST API design, validation, security practices, and API documentation. It also includes a basic real-time layer for task updates.
