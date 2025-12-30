import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { Blog } from '../types';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const context = useContext(AuthContext);
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [draftBlogs, setDraftBlogs] = useState<Blog[]>([]);
  const [activeTab, setActiveTab] = useState("published");

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { user }: AuthContextType = context;

  useEffect(() => {
    const fetchBlogs = async (): Promise<void> => {
      try {
        const response = await api.get<Blog[]>(`/api/blogs?user=${user?._id}`);

        const allBlogsData = response.data;
        const sortedBlogs = allBlogsData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setBlogs(sortedBlogs);
        setPublishedBlogs(sortedBlogs.filter(blog => blog.status === 'published'));
        setDraftBlogs(sortedBlogs.filter(blog => blog.status === 'draft'));
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

      fetchBlogs();
  }, [user]);

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
    <div className="container mx-auto">
        <div className='min-h-[30vh] bg-[linear-gradient(180deg,#c7ddff_0%,#ffffff_64%)] flex flex-col items-center gap-3'>
            <h1 className="text-3xl pt-6 font-bold mb-8 text-gray-800">My Blogs</h1>
            <div className="px-5 md:w-1/2 sm:w-full flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                <button
                    onClick={() => setActiveTab("published")}
                    className={`w-full px-5 py-2 rounded-lg text-sm font-medium transition
                    ${activeTab === "published"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600 hover:text-slate-900"}
                    `}
                >
                    Published
                </button>

                <button
                    onClick={() => setActiveTab("draft")}
                    className={`w-full px-5 py-2 rounded-lg text-sm font-medium transition
                    ${activeTab === "draft"
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-600 hover:text-slate-900"}
                    `}
                >
                    Drafts
                </button>
            </div>
        </div>
        <div className='px-7'>
            {activeTab === 'published' && (publishedBlogs.length>0? (
                <div className="mb-10">
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
                        {(
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
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        📝
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800">
                        No posts here yet
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                        You haven't created any blog posts. Start writing and share your ideas with the world.
                    </p>

                    <Link to="/create-blog" className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700">
                        Start Writing
                    </Link>
                </div>
            ))}

            {activeTab === 'draft' && (draftBlogs.length>0?(
                <div>
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
                        {(
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
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                        📄
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800">
                        No drafts yet
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                        You don't have any drafts saved. Start writing and your drafts will appear here automatically.
                    </p>

                    <Link to="/create-blog" className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700">
                        Start Writing
                    </Link>
                </div>
            ))}
        </div>
    </div>
  );
};

export default BlogList;

