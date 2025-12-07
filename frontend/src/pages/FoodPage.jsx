// src/pages/FoodPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  Clock,
  MapPin,
  Plus,
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react";

export default function FoodPage() {
  const { user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    food_type: "",
    quantity: "",
    expiry_time: "",
    location: "",
    description: "",
    meals_saved: 0,
  });

  const API_URL = "http://localhost:5000/api/food";
  const token = localStorage.getItem("token"); // unchanged

  // dynamic nav height (avoid collision with fixed nav)
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    const setHeight = () => {
      const nav = document.querySelector("nav");
      if (nav) setNavHeight(nav.offsetHeight);
      else setNavHeight(64);
    };
    setHeight();
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);

  // ----------------------------------------------------
  // WAIT FOR AUTH
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="pt-24 text-center text-gray-600 text-lg" style={{ paddingTop: navHeight || 64 }}>
        Loading...
      </div>
    );
  }

  // ----------------------------------------------------
  // FETCH FOOD POSTS
  // ----------------------------------------------------
  async function fetchPosts() {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data?.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------
  // TIME FORMATTER
  // ----------------------------------------------------
  function formatTimeRemaining(expiryTime) {
    if (!expiryTime) return "No expiry";
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;
  }

  // ----------------------------------------------------
  // CREATE / UPDATE FOOD
  // ----------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (editingId) {
        setPosts((prev) => prev.map((p) => (p._id === editingId ? data : p)));
      } else {
        setPosts((prev) => [data, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to post food");
    }
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      food_type: "",
      quantity: "",
      expiry_time: "",
      location: "",
      description: "",
      meals_saved: 0,
    });
  }

  // ----------------------------------------------------
  // EDIT FOOD
  // ----------------------------------------------------
  function startEdit(post) {
    setEditingId(post._id);
    setFormData({
      food_type: post.food_type || "",
      quantity: post.quantity || "",
      expiry_time: post.expiry_time ? post.expiry_time.slice(0, 16) : "",
      location: post.location || "",
      description: post.description || "",
      meals_saved: post.meals_saved || 0,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----------------------------------------------------
  // DELETE FOOD
  // ----------------------------------------------------
  async function handleDelete(id) {
    if (!confirm("Delete this post?")) return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete");
    }
  }

  // ----------------------------------------------------
  // CLAIM FOOD
  // ----------------------------------------------------
  async function handleClaim(id) {
    try {
      const res = await fetch(`${API_URL}/${id}/claim`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json(); // backend returns full updated post
      setPosts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (err) {
      console.error("Claim error:", err);
      alert("Failed to claim");
    }
  }

  // ----------------------------------------------------
  // LOADING UI
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50" style={{ paddingTop: navHeight || 64 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-28 bg-white rounded-xl shadow p-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 bg-white rounded-xl shadow animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-12" style={{ paddingTop: navHeight || 64 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </span>
              Food Waste Tracker
            </h1>
            <p className="mt-2 text-gray-600 max-w-xl">
              Reduce campus food waste by posting surplus meals. NGOs can claim pickups and mess staff can post updates.
            </p>
          </div>

          {(user.role === "mess_staff" || user.role === "admin") && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowForm((s) => !s);
                  setEditingId(null);
                }}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold shadow"
              >
                <Plus className="w-4 h-4" />
                {editingId ? "Update Food" : "Post Surplus Food"}
              </button>
            </div>
          )}
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Food Post" : "Post Surplus Food"}</h2>
              <button
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700"
                aria-label="Close form"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Food Type</label>
                  <input
                    type="text"
                    placeholder="e.g., Rice & Curry"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={formData.food_type}
                    onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g., 20 boxes"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Expiry Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={formData.expiry_time}
                    onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    placeholder="Pickup location"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Meals Saved</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 20"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                    value={formData.meals_saved}
                    onChange={(e) =>
                      setFormData({ ...formData, meals_saved: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700"> &nbsp;</label>
                  <div className="mt-1">
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold">
                      {editingId ? "Update Post" : "Post Food"}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Notes for pickup"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </form>
          </div>
        )}

        {/* POSTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-2xl shadow hover:shadow-lg transition border overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-teal-500">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{post.food_type}</h3>
                    <p className="text-sm opacity-90">{post.quantity}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      post.status === "available"
                        ? "bg-white text-green-700"
                        : post.status === "claimed"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {post.status}
                  </span>
                  <div className="mt-2 text-xs text-white/90">{formatTimeRemaining(post.expiry_time)}</div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">{formatTimeRemaining(post.expiry_time)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{post.location}</span>
                </div>

                {post.description && <p className="text-sm text-gray-700">{post.description}</p>}

                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{post.meals_saved} meals</span>
                  </div>

                  <p className="text-xs text-gray-500">Posted by {post.posted_by?.full_name || "Unknown"}</p>
                </div>

                {/* Actions */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {user.role === "ngo" && post.status === "available" && (
                    <button
                      onClick={() => handleClaim(post._id)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4" /> Claim Pickup
                    </button>
                  )}

                  {post.posted_by?._id === user._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No food posts yet</h3>
            <p className="text-gray-500">
              {user.role === "mess_staff" ? "Post surplus food to get started" : "Check back later for available food"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
