# MERN Stack Blogging Application

A full-stack blogging application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring user authentication, rich text editing, and auto-save functionality.

## Features

- **User Authentication**
  - User registration and login
  - JWT-based authentication
  - Protected routes for authenticated users

- **Blog Management**
  - Create, read, update, and delete blog posts
  - Rich text editing with React Quill
  - Auto-save drafts functionality
  - Tag support for blog posts
  - Separate views for published posts and drafts

- **User-Specific Features**
  - View all published blogs
  - View and manage your own blogs
  - View and manage your drafts
  - Edit and delete your own blogs

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- React Quill for rich text editing
- Axios for API requests
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blogging
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Add the following environment variables:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blogging
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Start the server
npm start
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Add the following environment variable:
REACT_APP_API_URL=http://localhost:5000

# Start the development server
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blogging
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Blogs
- `GET /api/blogs` - Get all blogs (with optional status and user filters)
- `GET /api/blogs/:id` - Get a specific blog
- `POST /api/blogs` - Create a new blog
- `PATCH /api/blogs/:id` - Update a blog
- `DELETE /api/blogs/:id` - Delete a blog

## Project Structure

```
blogging/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── BlogEditor.jsx
    │   │   ├── BlogList.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   │   └── axios.js
    │   ├── App.jsx
    │   └── index.js
    └── .env
```

## Features in Detail

### Auto-save Functionality
- Automatically saves drafts every 30 seconds
- Saves when user stops typing for 5 seconds
- Prevents data loss during editing

### Rich Text Editor
- Formatting options (bold, italic, lists, etc.)
- Image upload support
- Clean and intuitive interface

### User Authentication
- Secure password hashing
- JWT token-based authentication
- Protected routes for authenticated users
- Automatic token management

### Blog Management
- Create and edit blogs with rich text
- Save as draft or publish immediately
- Add tags to categorize blogs
- View all blogs or filter by status/user

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 