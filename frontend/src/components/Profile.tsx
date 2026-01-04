import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { User, Blog } from '../types';

const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [profileUser, setProfileUser] = useState<User & { blogs?: Blog[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { isAuthenticated, user }: AuthContextType = context;

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const userId = id || user?._id;
        if (!userId) {
          setLoading(false);
          return;
        }
        const response = await api.get<User & { blogs?: Blog[] }>(`/api/users/${userId}`);
        setProfileUser(response.data);
        if (isAuthenticated && user && response.data.followers) {
          setIsFollowing(response.data.followers.some(follower => follower._id === user._id));
        }
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [id, isAuthenticated, user]);

  const handleFollow = async (): Promise<void> => {
    if (!isAuthenticated) {
      alert('Please login to follow users');
      return;
    }
    const userId = id || user?._id;
    if (!userId) return;
    try {
      const response = await api.post<{ message: string; isFollowing: boolean }>(`/api/users/${userId}/follow`);
      setIsFollowing(response.data.isFollowing);
      if (profileUser) {
        const updatedFollowers = response.data.isFollowing
          ? [...(profileUser.followers || []), user!]
          : (profileUser.followers || []).filter(f => f._id !== user!._id);
        setProfileUser({ ...profileUser, followers: updatedFollowers });
      }
    } catch (err: any) {
      console.error('Error following user:', err);
      alert(err.response?.data?.message || 'Failed to follow user');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Profile not found.</p>
      </div>
    );
  }

  const isOwnProfile = isAuthenticated && user && user._id === profileUser._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{profileUser.firstName} {profileUser.lastName}</h1>
            <p className="text-gray-600">@{profileUser.username}</p>
            <p className="text-gray-500 text-sm mt-2">{profileUser.email}</p>
          </div>
          {isAuthenticated && !isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded font-bold ${isFollowing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
        <div className="flex gap-6 mb-6 text-center">
          <div>
            <p className="text-2xl font-bold">{profileUser.followers?.length || 0}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{profileUser.following?.length || 0}</p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>
        </div>
        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Published Blogs</h2>
          {profileUser.blogs && profileUser.blogs.length > 0 ? (
            <div className="space-y-4">
              {profileUser.blogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blogs/${blog._id}`}
                  className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Published on: {new Date(blog.updated_at).toLocaleDateString()} • 
                    Views: {blog.viewCount || 0} • 
                    Likes: {blog.likes?.length || 0}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No published blogs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
