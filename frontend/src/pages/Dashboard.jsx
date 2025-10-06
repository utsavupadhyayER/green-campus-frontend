import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import api from "../lib/api";
import StatCard from "../components/StatCard";
import {
  Package,
  Recycle,
  Users,
  Gift,
  Heart,
  TrendingUp,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  // Local state for data
  const [foodPosts, setFoodPosts] = useState([]);
  const [ewasteItems, setEwasteItems] = useState([]);
  const [volunteerEvents, setVolunteerEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [impactStats, setImpactStats] = useState(null);
  const [liveData, setLiveData] = useState(null);

  // Load all data when page loads
  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [foodRes, ewasteRes, eventRes, donationRes, impactRes, globalRes] =
        await Promise.all([
          api.get("/food"),
          api.get("/ewaste"),
          api.get("/volunteers"),
          api.get("/donations"),
          api.get("/impact"),
          api.get("/global-stats"),
        ]);

      setFoodPosts(foodRes.data);
      setEwasteItems(ewasteRes.data);
      setVolunteerEvents(eventRes.data);
      setDonations(donationRes.data);
      setImpactStats(impactRes.data);
      setLiveData(globalRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err.message);
    }
  }

  const formatLargeNumber = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  // Derived values
  const availableFood = foodPosts.filter((f) => f.status === "available").length;
  const availableEwaste = ewasteItems.filter((e) => e.status === "available").length;
  const upcomingEvents = volunteerEvents.filter((e) => e.status === "upcoming").length;
  const availableDonations = donations.filter((d) => d.status === "available").length;

  const globalFoodWaste = liveData?.food_waste || 1300000000;
  const hungerDeaths = liveData?.hunger_deaths || 9000000;
  const ewastePollution = liveData?.ewaste_pollution || 53600000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600">
            {user?.role === "student" &&
              "Make a difference on your campus today"}
            {user?.role === "ngo" &&
              "Manage pickups and coordinate volunteer events"}
            {user?.role === "mess_staff" &&
              "Help reduce food waste by posting surplus meals"}
            {user?.role === "admin" &&
              "Monitor campus sustainability initiatives"}
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/food">
            <StatCard
              title="Available Food"
              value={availableFood}
              icon={Package}
              subtitle="Surplus meals waiting"
              color="green"
            />
          </Link>
          <Link to="/ewaste">
            <StatCard
              title="E-Waste Items"
              value={availableEwaste}
              icon={Recycle}
              subtitle="Ready for recycling"
              color="blue"
            />
          </Link>
          <Link to="/volunteers">
            <StatCard
              title="Upcoming Events"
              value={upcomingEvents}
              icon={Users}
              subtitle="Volunteer opportunities"
              color="orange"
            />
          </Link>
          <Link to="/donations">
            <StatCard
              title="Available Donations"
              value={availableDonations}
              icon={Gift}
              subtitle="Items to claim"
              color="purple"
            />
          </Link>
        </div>

        {/* Global Live Data */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Global Impact - Live Data</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
              <Package className="w-10 h-10 mb-3 opacity-90" />
              <p className="text-sm opacity-80">Global Food Waste</p>
              <p className="text-3xl font-bold mt-2">{formatLargeNumber(globalFoodWaste)}</p>
              <p className="text-xs opacity-70 mt-1">tons per year</p>
              <p className="text-xs mt-2 opacity-60">Source: UN FAO</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
              <Heart className="w-10 h-10 mb-3 opacity-90" />
              <p className="text-sm opacity-80">Hunger Deaths</p>
              <p className="text-3xl font-bold mt-2">{formatLargeNumber(hungerDeaths)}</p>
              <p className="text-xs opacity-70 mt-1">deaths per year</p>
              <p className="text-xs mt-2 opacity-60">Source: WHO</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
              <Recycle className="w-10 h-10 mb-3 opacity-90" />
              <p className="text-sm opacity-80">E-Waste Pollution</p>
              <p className="text-3xl font-bold mt-2">{formatLargeNumber(ewastePollution)}</p>
              <p className="text-xs opacity-70 mt-1">tons CO₂ per year</p>
              <p className="text-xs mt-2 opacity-60">Source: E-Waste Monitor</p>
            </div>
          </div>
        </div>

        {/* Campus Impact Stats */}
        {impactStats && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Campus Impact Statistics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-3xl font-bold text-green-700">{impactStats.total_meals_saved}</p>
                <p className="text-sm text-gray-600 mt-1">Meals Saved</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-700">{impactStats.total_food_waste_kg.toFixed(0)}</p>
                <p className="text-sm text-gray-600 mt-1">Food Waste (kg)</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-3xl font-bold text-orange-700">{impactStats.total_ewaste_items}</p>
                <p className="text-sm text-gray-600 mt-1">E-Waste Items</p>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-3xl font-bold text-teal-700">{impactStats.total_co2_saved_kg.toFixed(0)}</p>
                <p className="text-sm text-gray-600 mt-1">CO₂ Saved (kg)</p>
              </div>
              <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                <p className="text-3xl font-bold text-violet-700">{impactStats.total_volunteers_active}</p>
                <p className="text-sm text-gray-600 mt-1">Active Volunteers</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-3xl font-bold text-red-700">{impactStats.total_donations}</p>
                <p className="text-sm text-gray-600 mt-1">Total Donations</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Food Posts & Upcoming Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Food Posts</h3>
            {foodPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{post.food_type}</p>
                    <p className="text-sm text-gray-600">{post.quantity} • {post.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    post.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
            <Link to="/food" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h3>
            {volunteerEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-800">{event.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(event.event_date).toLocaleDateString()} • {event.registered_count}/{event.max_volunteers} registered
                </p>
                <p className="text-xs text-green-600 font-semibold mt-1">+{event.points_reward} points</p>
              </div>
            ))}
            <Link to="/volunteers" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              View all →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
