import React, { useEffect, useState } from 'react';
import api from '../utils/axios'; // Import the custom axios instance
import { Link } from 'react-router-dom';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get('/api/blogs'); // Use the custom axios instance
        const allBlogsData = response.data;
        
        // Sort blogs by updated_at in descending order
        const sortedBlogs = allBlogsData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  
        setBlogs(sortedBlogs);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
  
    fetchBlogs();
  }, []);


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

  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">All Blog Posts</h1>

      {publishedBlogs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-5 text-gray-700">Published Posts</h2>
          <ul className="space-y-6">
            {publishedBlogs.map(blog => (
              <li key={blog._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 ease-in-out">
                <Link to={`/blogs/${blog._id}`} className="block text-blue-600 hover:text-blue-800 transition-colors duration-300 ease-in-out">
                  <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                </Link>
                <p className="text-gray-600 text-sm">Published on: {new Date(blog.updated_at).toLocaleDateString()}</p>
                {/* Optional: Display a short excerpt of the content */}
                {/* <p className="text-gray-700 mt-3">{blog.content.replace(/<[^>]*>/g, '').substring(0, 200)}...</p> */}
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
                 <Link to={`/edit-blog/${blog._id}`} className="block text-gray-700 hover:text-gray-900 transition-colors duration-300 ease-in-out">
                  <h3 className="text-xl font-bold mb-2">{blog.title || 'Untitled Draft'}</h3>
                 </Link>
                 <p className="text-gray-600 text-sm">Last saved: {new Date(blog.updated_at).toLocaleString()}</p>
                 {/* Optional: Display a short excerpt of the content */}
                 {/* <p className="text-gray-700 mt-3">{blog.content.replace(/<[^>]*>/g, '').substring(0, 200)}...</p> */}
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
}

export default BlogList; 