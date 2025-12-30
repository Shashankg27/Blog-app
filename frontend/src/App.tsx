import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';

import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import Register from './components/Register';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import BlogPostDetail from './components/BlogPostDetail';
import LandingPage from './components/LandingPage';

import AuthContext, { AuthContextType } from './context/AuthContext';
import Profile from './components/Profile';
import AllBlogs from './components/AllBlogs';
import MyBlogs from './components/MyBlogs';

const Navbar: React.FC = () => {
  const context = useContext(AuthContext);
  const [openProfile, setOpenProfile] = useState(false);
  const location = useLocation();

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { isAuthenticated, logout }: AuthContextType = context;

  const isActive = (path: string) => location.pathname === path;

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      className={`relative pb-1 transition ${
        isActive(path)
          ? 'text-blue-600'
          : 'text-slate-600 hover:text-blue-600'
      }`}
    >
      {label}
      {isActive(path) && (
        <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-blue-600 rounded-full transition-all" />
      )}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl text-slate-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          BlogSite
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLink('/', 'Explore')}
          {navLink('/all-blogs', 'Blogs')}
          {isAuthenticated && (
            <>
              {navLink('/create-blog', 'Write')}
              {navLink('/my-blogs', 'My Blogs')}
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setOpenProfile(!openProfile)}
                className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:ring-2 ring-blue-300 transition"
              >
                <i className="fa-regular fa-user" />
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition"
                  >
                    <i className="fa-regular fa-id-card" />
                    My Profile
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blogs/:id" element={<BlogPostDetail />} />
        <Route path="/all-blogs" element={<AllBlogs />} />
        <Route path="/my-blogs" element={<PrivateRoute element={MyBlogs} />} />
        <Route path="/create-blog" element={<PrivateRoute element={BlogEditor} />} />
        <Route path="/edit-blog/:id" element={<PrivateRoute element={BlogEditor} />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
