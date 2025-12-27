import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/axios';
import { Link, useLocation } from 'react-router-dom';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { Blog } from '../types';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { user }: AuthContextType = context;

  useEffect(() => {
    const fetchBlogs = async (): Promise<void> => {
      try {
        let response;
        const currentPath = location.pathname;

        if (currentPath === '/my-blogs') {
          response = await api.get<Blog[]>(`/api/blogs?user=${user?._id}&status=published`);
        } else if (currentPath === '/my-drafts') {
          response = await api.get<Blog[]>(`/api/blogs?user=${user?._id}&status=draft`);
        } else {
          response = await api.get<Blog[]>('/api/blogs');
        }

        const allBlogsData = response.data;
        const sortedBlogs = allBlogsData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setBlogs(sortedBlogs);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    if (location.pathname === '/all-blogs' || user) {
      fetchBlogs();
    }
  }, [location.pathname, user]);

  const handleDelete = async (blogId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/blogs/${blogId}`);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const isMyBlogsRoute = location.pathname === '/my-blogs';
  const isMyDraftsRoute = location.pathname === '/my-drafts';
  const showDeleteButtons = isMyBlogsRoute || isMyDraftsRoute;

  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [draftBlogs, setDraftBlogs] = useState<Blog[]>([]);
  setPublishedBlogs(blogs.filter(blog => blog.status === 'published'));
  if(user && user._id !== null) setDraftBlogs(blogs.filter(blog => (blog.status === 'draft' && blog.user._id === user._id)));

  const getPageTitle = (): string => {
    if (isMyBlogsRoute) return 'My Published Blogs';
    if (isMyDraftsRoute) return 'My Drafts';
    return 'All Blog Posts';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>Error loading blogs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{getPageTitle()}</h1>

      {publishedBlogs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-5 text-gray-700">Published Posts</h2>
          <ul className="space-y-6">
            {publishedBlogs.map(blog => (
              <li key={blog._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 ease-in-out">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {blog.imageUrl && (
                      <div className="mb-3">
                        <img 
                          src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`} 
                          alt={blog.title}
                          className="w-full max-w-xs h-48 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    )}
                    <Link to={`/blogs/${blog._id}`} className="block text-blue-600 hover:text-blue-800 transition-colors duration-300 ease-in-out">
                      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm">Published on: {new Date(blog.updated_at).toLocaleDateString()}</p>
                  </div>
                  {showDeleteButtons && (
                    <div className="ml-4 flex gap-2">
                      <Link
                        to={`/edit-blog/${blog._id}`}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {draftBlogs.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-5 text-gray-700">Drafts</h2>
          <ul className="space-y-6">
            {draftBlogs.map(blog => (
              <li key={blog._id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 ease-in-out">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/edit-blog/${blog._id}`} className="block text-gray-700 hover:text-gray-900 transition-colors duration-300 ease-in-out">
                      <h3 className="text-xl font-bold mb-2">{blog.title || 'Untitled Draft'}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm">Last saved: {new Date(blog.updated_at).toLocaleString()}</p>
                  </div>
                  {showDeleteButtons && (
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {publishedBlogs.length === 0 && draftBlogs.length === 0 && (
        <div className="text-center text-gray-600">
          <p>No blog posts or drafts found.</p>
        </div>
      )}
    </div>
  );
};

export default BlogList;

