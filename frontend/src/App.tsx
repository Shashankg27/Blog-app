import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import Register from './components/Register';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import BlogPostDetail from './components/BlogPostDetail';
import AuthContext, { AuthContextType } from './context/AuthContext';

const App: React.FC = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { isAuthenticated, logout }: AuthContextType = context;

  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/all-blogs" className="text-white text-lg font-bold">BlogSite</Link>
            <div>
              <Link to="/all-blogs" className="text-gray-300 hover:text-white mr-4">All Blogs</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/my-blogs" className="text-gray-300 hover:text-white mr-4">My Blogs</Link>
                  <Link to="/my-drafts" className="text-gray-300 hover:text-white mr-4">My Drafts</Link>
                  <Link to="/create-blog" className="text-gray-300 hover:text-white mr-4">Create New Blog</Link>
                  <button onClick={logout} className="text-gray-300 hover:text-white">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-gray-300 hover:text-white mr-4">Register</Link>
                  <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blogs/:id" element={<BlogPostDetail />} />
          <Route path="/all-blogs" element={<BlogList />} />
          <Route path="/my-blogs" element={<PrivateRoute element={BlogList} />} />
          <Route path="/my-drafts" element={<PrivateRoute element={BlogList} />} />
          <Route path="/create-blog" element={<PrivateRoute element={BlogEditor} />} />
          <Route path="/edit-blog/:id" element={<PrivateRoute element={BlogEditor} />} />
          <Route path="/" element={<Link to="/all-blogs" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

