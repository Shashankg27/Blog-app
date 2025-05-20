import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import AuthContext from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/my-blogs');
    } catch (err) {
      console.error(err.response.data);
      alert('Login failed.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={onSubmit}>
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="********"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 