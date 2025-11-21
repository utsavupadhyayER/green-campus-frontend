import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Recycle, MapPin, Plus, CheckCircle,
  Smartphone, Laptop, Zap, Tablet
} from 'lucide-react';

export default function EwastePage() {
  const { user, loading: authLoading } = useAuth();

  // Wait until auth finishes
  if (authLoading || !user?.token) {
    return (
      <div className="pt-24 text-center text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    item_type: "mobile",
    quantity: 1,
    condition: "",
    location: "",
    description: ""
  });

  const API_URL = "http://localhost:5000/api/ewaste";

  // ==============================================
  // FETCH POSTS
  // ==============================================
  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setPosts(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ==============================================
  // CREATE POST
  // ==============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const co2Map = { mobile: 12.5, laptop: 45, charger: 2.5, tablet: 25, other: 10 };

    const payload = {
      ...formData,
      co2_saved_kg: co2Map[formData.item_type] * formData.quantity
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const created = await res.json();
      setPosts([created.data, ...posts]);
      setShowForm(false);
      setFormData({
        item_type: "mobile",
        quantity: 1,
        condition: "",
        location: "",
        description: ""
      });

    } catch (err) {
      console.error("Post error:", err);
    }
  };

  // ==============================================
  // CLAIM
  // ==============================================
  const handleClaim = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/claim`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updated = await res.json();
      setPosts(posts.map(p => p._id === id ? updated.data : p));

    } catch (err) {
      console.error("Claim error:", err);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "mobile": return Smartphone;
      case "laptop": return Laptop;
      case "tablet": return Tablet;
      case "charger": return Zap;
      default: return Recycle;
    }
  };

  if (loading) {
    return (
      <div className="pt-24 text-center text-gray-600 text-lg">
        Loading e-waste posts...
      </div>
    );
  }

  // ==============================================
  // MAIN UI
  // ==============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              E-Waste Recycling
            </h1>
            <p className="text-gray-600">
              Give your old electronics a second life through proper recycling
            </p>
          </div>

          {(user.role === "student" || user.role === "admin") && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Post E-Waste
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Post E-Waste for Recycling
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-semibold mb-1">Item Type</label>
                  <select
                    value={formData.item_type}
                    onChange={(e) =>
                      setFormData({ ...formData, item_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="laptop">Laptop</option>
                    <option value="charger">Charger</option>
                    <option value="tablet">Tablet</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Condition</label>
                  <input
                    type="text"
                    required
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
                Post E-Waste
              </button>
            </form>
          </div>
        )}

        {/* POSTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {posts.map((post) => {
            const Icon = getItemIcon(post.item_type);

            return (
              <div
                key={post._id}
                className="bg-white rounded-xl shadow-md border hover:shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                  <div className="flex justify-between items-start">
                    <div className="text-white flex items-center gap-3">
                      <Icon className="w-8 h-8" />
                      <div>
                        <h3 className="text-xl font-bold capitalize">
                          {post.item_type}
                        </h3>
                        <p className="text-sm opacity-90">
                          Quantity: {post.quantity}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === "available"
                          ? "bg-white text-blue-700"
                          : post.status === "claimed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{post.location}</span>
                  </div>

                  <p className="text-sm text-gray-800">
                    <strong>Condition:</strong> {post.condition}
                  </p>

                  <p className="text-sm text-gray-700">{post.description}</p>

                  <div className="flex justify-between items-center border-t pt-2">
                    <div className="flex items-center gap-2">
                      <Recycle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700">
                        {post.co2_saved_kg} kg CO₂
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      Posted by {post.posted_by?.full_name || "Unknown"}
                    </span>
                  </div>

                  {user.role === "ngo" && post.status === "available" && (
                    <button
                      onClick={() => handleClaim(post._id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Schedule Pickup
                    </button>
                  )}

                </div>
              </div>
            );
          })}

        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <Recycle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No e-waste posts yet
            </h3>
            <p className="text-gray-500">
              {user.role === "student"
                ? "Post your old electronics to get started"
                : "Check back later for available e-waste"}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
