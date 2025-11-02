import React, { useState, useContext, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import AuthContext, { AuthContextType } from '../context/AuthContext';

interface LoginResponse {
  token: string;
  message?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { login }: AuthContextType = context;

  const { username, password } = formData;

  const onChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { username, password });
      await login(res.data.token);
      navigate('/all-blogs');
    } catch (err: any) {
      console.error(err.response?.data || err.message);
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
};

export default Login;

