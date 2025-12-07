// src/pages/EwastePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Recycle,
  MapPin,
  Plus,
  CheckCircle,
  Smartphone,
  Laptop,
  Zap,
  Tablet,
} from "lucide-react";

export default function EwastePage() {
  const { user, loading: authLoading } = useAuth();

  // ---------- hooks (always declared first) ----------
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState({
    item_type: "mobile",
    quantity: 1,
    condition: "",
    location: "",
    description: "",
  });

  const API_URL = "http://localhost:5000/api/ewaste";

  // ---------- helpers ----------
  const getItemIcon = (type) => {
    switch (type) {
      case "mobile":
        return Smartphone;
      case "laptop":
        return Laptop;
      case "tablet":
        return Tablet;
      case "charger":
        return Zap;
      default:
        return Recycle;
    }
  };

  const totalAvailable = posts.filter((p) => p.status === "available").length;
  const totalCO2 = posts.reduce((s, p) => s + (Number(p.co2_saved_kg) || 0), 0);

  // ---------- fetch posts ----------
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setFetchError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // only fetch when auth finished and token exists
  useEffect(() => {
    if (!authLoading && user?.token) {
      fetchPosts();
    } else if (!authLoading && !user?.token) {
      setLoading(false);
    }
  }, [authLoading, user?.token, fetchPosts]);

  // ---------- create post ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const co2Map = {
      mobile: 12.5,
      laptop: 45,
      charger: 2.5,
      tablet: 25,
      other: 10,
    };

    const payload = {
      ...formData,
      quantity: Number(formData.quantity) || 1,
      co2_saved_kg:
        (co2Map[formData.item_type] || 0) * (Number(formData.quantity) || 1),
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

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const created = await res.json();
      setPosts((prev) => [created.data, ...prev]);
      setShowForm(false);
      setFormData({
        item_type: "mobile",
        quantity: 1,
        condition: "",
        location: "",
        description: "",
      });
    } catch (err) {
      console.error("Post error:", err);
      alert(err.message || "Failed to create post");
    }
  };

  // ---------- claim ----------
  const handleClaim = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/claim`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const updated = await res.json();
      // updated.data should be the updated post
      setPosts((prev) => prev.map((p) => (p._id === id ? updated.data : p)));
    } catch (err) {
      console.error("Claim error:", err);
      alert(err.message || "Failed to claim item");
    }
  };

  // ---------- render states ----------
  if (authLoading) {
    return (
      <div className="pt-24 text-center text-gray-600 text-lg">
        Checking authentication...
      </div>
    );
  }

  if (!user?.token) {
    return (
      <div className="pt-24 text-center">
        <p className="text-lg text-gray-700 mb-2">You are not authenticated.</p>
        <p className="text-sm text-gray-500">
          Please login again or verify your auth provider returns a token.
        </p>
      </div>
    );
  }

  // skeleton loader for posts
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-3 mt-4">
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 bg-white rounded-xl shadow border">
                <div className="h-36 bg-gray-100 rounded mb-4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="pt-24 text-center text-red-600">
        Error loading posts: {fetchError}
      </div>
    );
  }

  // ---------- main UI ----------
  // robust owner id check: user may have _id or id
  const currentUserId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
              E-Waste Recycling
            </h1>
            <p className="text-gray-600">
              Give your old electronics a second life through proper recycling.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
                <Recycle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">{totalAvailable} available</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-medium text-sm">{Math.round(totalCO2)} kg CO₂ saved</span>
              </div>
            </div>
          </div>

          {(user.role === "student" || user.role === "admin") && (
            <div className="ml-auto">
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow transition-transform transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Post E-Waste
              </button>
            </div>
          )}
        </div>

        {/* Form Card */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Post E-Waste for Recycling</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Item Type</label>
                  <select
                    value={formData.item_type}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
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
                      setFormData({ ...formData, quantity: parseInt(e.target.value || "1") })
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
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold">Post E-Waste</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg border">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* POSTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const Icon = getItemIcon(post.item_type);

            // don't allow owner to claim their own post
            const isOwner = post.posted_by && (post.posted_by._id === currentUserId || post.posted_by === currentUserId);

            return (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow hover:shadow-xl border overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4">
                  <div className="flex justify-between items-start">
                    <div className="text-white flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-md">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold capitalize">{post.item_type}</h3>
                        <p className="text-sm opacity-90">Quantity: {post.quantity}</p>
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

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{post.location}</span>
                  </div>

                  <p className="text-sm text-gray-800"><strong>Condition:</strong> {post.condition}</p>
                  <p className="text-sm text-gray-700 truncate">{post.description || "No description provided."}</p>

                  <div className="flex justify-between items-center border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Recycle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700">{post.co2_saved_kg} kg CO₂</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Posted by</div>
                      <div className="text-sm font-medium text-gray-700">{post.posted_by?.full_name || "Unknown"}</div>
                    </div>
                  </div>

                  {/* CLAIM BUTTON: visible to NGO and STUDENT (not the owner) */}
                  {post.status === "available" && !isOwner && (user.role === "ngo" || user.role === "student") && (
                    <div>
                      {user.role === "ngo" ? (
                        <button
                          onClick={() => handleClaim(post._id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Schedule Pickup
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaim(post._id)}
                          className="w-full bg-green-600 text-white py-2 rounded-lg mt-3 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Claim Item
                        </button>
                      )}
                    </div>
                  )}

                  {/* If claimed, show claimed_by */}
                  {post.status === "claimed" && post.claimed_by && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm">
                      Claimed by <span className="font-semibold">{post.claimed_by.full_name || "Someone"}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <Recycle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No e-waste posts yet</h3>
            <p className="text-gray-500">{user.role === "student" ? "Post your old electronics to get started" : "Check back later for available e-waste"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
