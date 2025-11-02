import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import { Blog } from '../types';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBlog = async (): Promise<void> => {
      try {
        if (!id) return;
        const response = await api.get<Blog>(`/api/blogs/${id}`);
        setBlog(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
        console.error('Error fetching blog post:', err);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

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
        {blog.imageUrl && (
          <div className="mb-6">
            <img 
              src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`} 
              alt={blog.title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
        <div
          className="prose prose-lg max-w-none leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
};

export default BlogPostDetail;

