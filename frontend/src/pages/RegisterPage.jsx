import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, CircleUser as UserCircle, Building2, ChefHat } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // NO ADMIN OPTION HERE
  const roles = [
    { value: 'student', label: 'Student', icon: UserCircle },
    { value: 'ngo', label: 'NGO', icon: Building2 },
    { value: 'mess_staff', label: 'Mess Staff', icon: ChefHat },
  ];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Password validation
  const passwordRegex = /^(?=.*[0-9]).{6,}$/;

  const roleRedirectMap = {
    student: '/food',
    ngo: '/volunteers',
    mess_staff: '/food',
  };

  const handleRegister = async () => {
    setMessage('');

    if (!selectedRole || !fullName || !email || !password) {
      setMessage("All fields are required");
      return;
    }

    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address");
      return;
    }

    if (!passwordRegex.test(password)) {
      setMessage("Password must be at least 6 characters and contain a number");
      return;
    }

    try {
      await signUp(fullName, email, password, selectedRole);
      navigate(roleRedirectMap[selectedRole] || '/');
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
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
          <p className="text-xl text-gray-600">Real-Time Sustainability Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Create Account</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              className="w-full p-3 mb-3 border rounded-lg"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="w-full p-3 mb-3 border rounded-lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full p-3 border rounded-lg"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && <p className="text-center text-red-600 mb-4">{message}</p>}

          <button
            onClick={handleRegister}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-xl"
          >
            Register
          </button>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account? <Link to="/login" className="text-green-600">Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
