import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function BlogPostDetail() {
  const { id } = useParams(); // Get blog ID from URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch single blog post
        const res = await axios.get(`/api/blogs/${id}`);
        setBlog(res.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error('Error fetching blog post:', err);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]); // Re-run effect if ID changes

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>Error loading blog post: {error.message}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800 leading-tight">{blog.title}</h1>
        <p className="text-gray-600 text-sm mb-4">Published on: {new Date(blog.updated_at).toLocaleDateString()}</p>
        {blog.tags && blog.tags.length > 0 && (
          <p className="text-gray-600 text-sm mb-6">Tags: {blog.tags.join(', ')}</p>
        )}
        {/* Render HTML content using dangerouslySetInnerHTML */}
        <div
          className="prose prose-lg max-w-none leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>
      </article>
    </div>
  );
}

export default BlogPostDetail; 