import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Leaf,
  LogOut,
  User,
  Home,
  Package,
  Recycle,
  Calendar,
  Gift,
  TrendingUp,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive(path)
        ? "bg-green-600 text-white shadow-lg"
        : "text-gray-700 hover:bg-green-50 hover:text-green-700"
    }`;

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-green-700"
          >
            <Leaf className="w-8 h-8" />
            <span>GreenCampus 2.0</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-green-50"
            onClick={toggleMobileMenu}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {/* Links */}
          {user && (
            <div
              className={`${
                mobileOpen
                  ? "absolute top-16 left-0 w-full bg-white shadow-md border-t flex flex-col gap-2 p-4 z-50"
                  : "hidden sm:flex sm:flex-row sm:items-center gap-3"
              }`}
            >
              <Link to="/" className={linkClass("/")}>
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* Food Dropdown */}
              {(user.role === "mess_staff" || user.role === "admin") && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("food")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    <Package className="w-4 h-4" />
                    <span>Food</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {openDropdown === "food" && (
                    <div className="absolute bg-white shadow-lg rounded-lg mt-2 w-44 border z-50">
                      <Link
                        to="/food"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50"
                      >
                        Manage Food Posts
                      </Link>
                      <Link
                        to="/donations"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50"
                      >
                        Food Donations
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* E-Waste */}
              {(user.role === "student" || user.role === "admin") && (
                <Link to="/ewaste" className={linkClass("/ewaste")}>
                  <Recycle className="w-4 h-4" />
                  <span>E-Waste</span>
                </Link>
              )}

              {/* Volunteers Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("volunteers")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Volunteers</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === "volunteers" && (
                  <div className="absolute bg-white shadow-lg rounded-lg mt-2 w-44 border z-50">
                    <Link
                      to="/volunteers"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50"
                    >
                      Events
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50"
                    >
                      Leaderboard
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/impact" className={linkClass("/impact")}>
                <TrendingUp className="w-4 h-4" />
                <span>Impact</span>
              </Link>

              {/* User Section */}
              <div className="flex items-center gap-3 ml-0 sm:ml-4 sm:pl-4 border-t sm:border-t-0 sm:border-l border-gray-300 pt-3 sm:pt-0">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-green-700" />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-green-600 capitalize">
                      {user.role.replace("_", " ")}
                    </div>
                  </div>
                  {user.role === "student" && (
                    <div className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {user.volunteer_points} pts
                    </div>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
