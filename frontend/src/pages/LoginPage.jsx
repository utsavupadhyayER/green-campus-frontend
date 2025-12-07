import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const roleRedirectMap = {
    student: '/food',
    ngo: '/volunteers',
    mess_staff: '/food',
    admin: '/impact',
  };

  const handleLogin = async () => {
    setError('');

    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      const res = await signIn(email, password);
      const storedToken = localStorage.getItem("token");

      const meResponse = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      const user = await meResponse.json();
      navigate(roleRedirectMap[user.role] || '/');

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-16 h-16 text-green-600" />
            <h1 className="text-5xl font-bold text-gray-800">GreenCampus</h1>
          </div>
          <p className="text-xl text-gray-600">Login to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Login</h2>

          <div className="mb-4">
            <input
              className="w-full p-3 mb-3 border rounded-lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full p-3 border rounded-lg"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-center text-red-600 mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-xl"
          >
            Login
          </button>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Don’t have an account? <Link to="/register" className="text-green-600">Register</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
