import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Leaf,
  LogOut,
  User,
  Home,
  Package,
  Recycle,
  Calendar,
  TrendingUp,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isActiveDropdown = (paths) => paths.includes(location.pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-green-700">
            <Leaf className="w-8 h-8" />
            <span>GreenCampus</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-green-50"
            onClick={toggleMobileMenu}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {/* Navigation */}
          {user && (
            <div
              ref={dropdownRef}
              className={`${
                mobileOpen
                  ? "absolute top-16 left-0 w-full bg-white shadow-md border-t flex flex-col gap-2 p-4 z-50"
                  : "hidden sm:flex sm:flex-row sm:items-center gap-3"
              }`}
            >
              {/* Dashboard */}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/")}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* ---------------- FOOD MENU FIXED ---------------- */}
              {(user.role === "mess_staff" || user.role === "admin") && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("food")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActiveDropdown(["/food", "/donations"])
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Food</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {openDropdown === "food" && (
                    <div className="absolute bg-white shadow-lg rounded-lg mt-2 w-44 border z-50">

                      {/* Mess Staff + Admin: Manage Food */}
                      <Link
                        to="/food"
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2 hover:bg-green-50"
                      >
                        Manage Food Posts
                      </Link>

                      {/* Admin Only: Donations */}
                      {user.role === "admin" && (
                        <Link
                          to="/donations"
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 hover:bg-green-50"
                        >
                          Food Donations
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- E-WASTE ---------------- */}
              {(user.role === "student" || user.role === "admin") && (
                <Link
                  to="/ewaste"
                  onClick={() => setMobileOpen(false)}
                  className={linkClass("/ewaste")}
                >
                  <Recycle className="w-4 h-4" />
                  <span>E-Waste</span>
                </Link>
              )}

              {/* ---------------- VOLUNTEERS DROPDOWN ---------------- */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("volunteers")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActiveDropdown(["/volunteers", "/leaderboard"])
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Volunteers</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {openDropdown === "volunteers" && (
                  <div className="absolute bg-white shadow-lg rounded-lg mt-2 w-44 border z-50">
                    <Link
                      to="/volunteers"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 hover:bg-green-50"
                    >
                      Events
                    </Link>
                    <Link
                      to="/leaderboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 hover:bg-green-50"
                    >
                      Leaderboard
                    </Link>
                  </div>
                )}
              </div>

              {/* ---------------- IMPACT ---------------- */}
              <Link
                to="/impact"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/impact")}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Impact</span>
              </Link>

              {/* ---------------- USER SECTION ---------------- */}
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

                  {/* Student Points */}
                  {user.role === "student" && (
                    <div className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {user?.volunteer_points || 0} pts
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
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
