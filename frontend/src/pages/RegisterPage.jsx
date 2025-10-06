import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, CircleUser as UserCircle, Building2, ChefHat, Shield } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth(); // ✅ use AuthContext
  const [selectedRole, setSelectedRole] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const roles = [
    { value: 'student', label: 'Student', icon: UserCircle },
    { value: 'ngo', label: 'NGO', icon: Building2 },
    { value: 'mess_staff', label: 'Mess Staff', icon: ChefHat },
    { value: 'admin', label: 'Admin', icon: Shield },
  ];

  const roleRedirectMap = {
    student: '/food',
    ngo: '/volunteers',
    mess_staff: '/donations',
    admin: '/impact',
  };

  const handleRegister = async () => {
    if (!selectedRole) return setMessage('Please select a role');
    if (!fullName || !email || !password) return setMessage('All fields are required');

    try {
      await signUp(fullName, email, password, selectedRole); // ✅ register & set user in context

      const redirectPath = roleRedirectMap[selectedRole] || '/';
      navigate(redirectPath);
    } catch (err) {
      setMessage(err.message || 'Registration failed');
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
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Create Account</h2>
          <p className="text-center text-gray-600 mb-8">Select role & enter your details</p>

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
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 mb-3 border rounded-lg"
            />
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

          {message && <p className="text-center text-red-600 mb-4">{message}</p>}

          <button
            onClick={handleRegister}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
              selectedRole && fullName && email && password
                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!selectedRole || !fullName || !email || !password}
          >
            {selectedRole ? 'Continue as ' + roles.find((r) => r.value === selectedRole)?.label : 'Select a Role'}
          </button>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
