import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { User } from '../types';

const Bloggers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [bloggers, setBloggers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get<User[]>('/api/users/search?q=');
        setAllUsers(response.data);
        setBloggers(response.data);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setBloggers(allUsers);
      return;
    }

    const query = value.toLowerCase();

    const filtered = allUsers.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query)
    );

    setBloggers(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Bloggers</h1>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search by username, first name, or last name..."
            className="flex-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading bloggers...</p>}

      {!loading && bloggers.length === 0 && (
        <p className="text-gray-500 text-center">No bloggers found.</p>
      )}

      <div className="space-y-4">
        {bloggers.map(blogger => (
          <Link
            key={blogger._id}
            to={`/profile/${blogger._id}`}
            className="block bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold mb-1">
              {blogger.firstName} {blogger.lastName}
            </h3>
            <p className="text-gray-600">@{blogger.username}</p>
            <p className="text-gray-500 text-sm mt-2">{blogger.email}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <span>{blogger.followers?.length || 0} Followers</span>
              <span>•</span>
              <span>{blogger.following?.length || 0} Following</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Bloggers;
