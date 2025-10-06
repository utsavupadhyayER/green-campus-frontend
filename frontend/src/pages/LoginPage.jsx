import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, CircleUser as UserCircle, Building2, ChefHat, Shield } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const roles = [
    { value: 'student', label: 'Student', icon: UserCircle, color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 'ngo', label: 'NGO', icon: Building2, color: 'bg-green-500 hover:bg-green-600' },
    { value: 'mess_staff', label: 'Mess Staff', icon: ChefHat, color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-red-500 hover:bg-red-600' },
  ];

  const roleRedirectMap = {
    student: '/food',
    ngo: '/volunteers',
    mess_staff: '/donations',
    admin: '/impact',
  };

  const handleLogin = async () => {
    if (!selectedRole) return setError('Please select a role');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', selectedRole);

      // ✅ Redirect based on role
      const redirectPath = roleRedirectMap[selectedRole] || '/';
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-16 h-16 text-green-600" />
            <h1 className="text-5xl font-bold text-gray-800">GreenCampus 2.0</h1>
          </div>
          <p className="text-xl text-gray-600">Real-Time Sustainability & Volunteer Platform</p>
          <p className="text-sm text-gray-500 mt-2">Connect. Contribute. Create Impact.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Login</h2>
          <p className="text-center text-gray-600 mb-8">Select role & enter credentials</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === role.value
                      ? 'border-green-500 bg-green-50 scale-105 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                  <p className="font-semibold text-lg text-gray-800">{role.label}</p>
                </button>
              );
            })}
          </div>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-3 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
              selectedRole
                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!selectedRole}
          >
            {selectedRole ? 'Continue as ' + roles.find((r) => r.value === selectedRole)?.label : 'Select a Role'}
          </button>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Don’t have an account?{' '}
            <Link to="/register" className="text-green-600 hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Mode</h3>
            <p className="text-sm text-blue-800">
              For demonstration, you can login using any role. In production, real credentials are required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
