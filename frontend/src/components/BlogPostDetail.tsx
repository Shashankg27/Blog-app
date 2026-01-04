import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import { Blog, Comment } from '../types';
import AuthContext, { AuthContextType } from '../context/AuthContext';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { isAuthenticated, user }: AuthContextType = context;

  useEffect(() => {
    const fetchBlog = async (): Promise<void> => {
      try {
        if (!id) return;
        const response = await api.get<Blog & { comments?: Comment[] }>(`/api/blogs/${id}`);
        setBlog(response.data);
        if (response.data.comments) {
          setComments(response.data.comments);
        }
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

  const handleLike = async (): Promise<void> => {
    if (!isAuthenticated) {
      alert('Please login to like blogs');
      return;
    }
    try {
      const response = await api.post<{ likes: string[]; dislikes: string[]; userLiked: boolean }>(`/api/blogs/${id}/like`);
      if (blog) {
        setBlog({
          ...blog,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
        });
      }
    } catch (err: any) {
      console.error('Error liking blog:', err);
      alert(err.response?.data?.message || 'Failed to like blog');
    }
  };

  const handleDislike = async (): Promise<void> => {
    if (!isAuthenticated) {
      alert('Please login to dislike blogs');
      return;
    }
    try {
      const response = await api.post<{ likes: string[]; dislikes: string[]; userDisliked: boolean }>(`/api/blogs/${id}/dislike`);
      if (blog) {
        setBlog({
          ...blog,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
        });
      }
    } catch (err: any) {
      console.error('Error disliking blog:', err);
      alert(err.response?.data?.message || 'Failed to dislike blog');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }
    try {
      const response = await api.post<Comment>(`/api/blogs/${id}/comments`, { content: newComment });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const userLiked = blog && user && blog.likes?.some((likeId: string) => likeId === user._id);
  const userDisliked = blog && user && blog.dislikes?.some((dislikeId: string) => dislikeId === user._id);

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
        <div className="flex items-center gap-4 mb-4 text-gray-600 text-sm">
          <span>By: {blog.user.firstName} {blog.user.lastName} (@{blog.user.username})</span>
          <span>•</span>
          <span>Published on: {new Date(blog.updated_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>Views: {blog.viewCount || 0}</span>
        </div>
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded ${userLiked ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
            disabled={!isAuthenticated}
          >
            <span>👍</span>
            <span>Like ({blog.likes?.length || 0})</span>
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center gap-2 px-4 py-2 rounded ${userDisliked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-red-600 hover:text-white transition-colors`}
            disabled={!isAuthenticated}
          >
            <span>👎</span>
            <span>Dislike ({blog.dislikes?.length || 0})</span>
          </button>
        </div>
        <div
          className="prose prose-lg max-w-none leading-relaxed text-gray-800 mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        <div className="border-t pt-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
          {isAuthenticated && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border rounded-lg mb-2"
                rows={3}
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Post Comment
              </button>
            </form>
          )}
          {!isAuthenticated && (
            <p className="text-gray-600 mb-4">Please login to comment</p>
          )}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">{comment.user.firstName} {comment.user.lastName}</span>
                  <span className="text-gray-500 text-sm">@{comment.user.username}</span>
                  <span className="text-gray-400 text-xs">• {new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostDetail;

