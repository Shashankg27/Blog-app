import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { Blog } from '../types';

const AllBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const context = useContext(AuthContext);
  const [search, setSearch] = useState('');

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  useEffect(() => {
    const fetchBlogs = async (): Promise<void> => {
      try {
        const response = await api.get<Blog[]>('/api/blogs');

        const allBlogsData = response.data;
        const sortedBlogs = allBlogsData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setBlogs(sortedBlogs.filter(blog => blog.status === 'published'));
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    fetchBlogs();

    }, []);

    const filteredBlogs = blogs.filter((blog) => {
        const query = search.toLowerCase();
        
        return (
            blog.title.toLowerCase().includes(query) ||
            blog.content.toLowerCase().includes(query) ||
            blog.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        );
    });
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
        <div className='bg-[linear-gradient(180deg,#c7ddff_0%,#ffffff_64%)] flex flex-col gap-3'>
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center pt-7">All Blogs</h1>
                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                    <input
                        type="text"
                        placeholder="Search blogs or tags..."
                        className="w-full sm:w-80 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition">
                        Search
                    </button>
                </div>
        </div>

      <div>
        {blogs.length === 0?(
            <div>
                <p>No Blog found!</p>
            </div>
        ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-6">
            {filteredBlogs.map((blog) => (
                <div
                key={blog._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                {/* Image */}
                {blog.imageUrl && (
                    <img
                    src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`}
                    alt={blog.title}
                    className="w-full h-44 object-cover"
                    />
                )}

                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {blog.title}
                    </h3>

                    <div
                    className="text-sm text-slate-600 leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    <Link to={`/blogs/${blog._id}`} className="text-blue-600 font-medium hover:underline cursor-pointer">
                        Read More →
                    </Link>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  )
};

export default AllBlogs;

