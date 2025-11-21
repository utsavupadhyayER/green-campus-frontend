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

  const token = localStorage.getItem("token"); // ✅ Correct token source

  // ----------------------------------------------------
  // WAIT FOR AUTH
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="pt-24 text-center text-gray-600 text-lg">
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
      setPosts(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  // ----------------------------------------------------
  // TIME FORMATTER
  // ----------------------------------------------------
  function formatTimeRemaining(expiryTime) {
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
        setPosts(posts.map((p) => (p._id === editingId ? data : p)));
      } else {
        setPosts([data, ...posts]);
      }

      resetForm();
    } catch (err) {
      console.error("Submit error:", err);
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
      food_type: post.food_type,
      quantity: post.quantity,
      expiry_time: post.expiry_time?.slice(0, 16),
      location: post.location,
      description: post.description,
      meals_saved: post.meals_saved,
    });
    setShowForm(true);
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

      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
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

      setPosts(posts.map((p) => (p._id === id ? data : p)));
    } catch (err) {
      console.error("Claim error:", err);
    }
  }

  // ----------------------------------------------------
  // LOADING UI
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="pt-24 text-center text-gray-600 text-lg">
        Loading food posts...
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Food Waste Tracker
            </h1>
            <p className="text-gray-600">Reduce food waste and save meals</p>
          </div>

          {(user.role === "mess_staff" || user.role === "admin") && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {editingId ? "Update Food" : "Post Surplus Food"}
            </button>
          )}
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Food Post" : "Post Surplus Food"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  type="text"
                  placeholder="Food Type"
                  required
                  className="border p-2 rounded"
                  value={formData.food_type}
                  onChange={(e) =>
                    setFormData({ ...formData, food_type: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Quantity"
                  required
                  className="border p-2 rounded"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />

                <input
                  type="datetime-local"
                  required
                  className="border p-2 rounded"
                  value={formData.expiry_time}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_time: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Location"
                  required
                  className="border p-2 rounded"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Meals Saved"
                  required
                  className="border p-2 rounded"
                  value={formData.meals_saved}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meals_saved: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <textarea
                className="border p-2 w-full rounded"
                placeholder="Description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <button className="w-full bg-green-600 text-white py-3 rounded-lg">
                {editingId ? "Update Post" : "Post Food"}
              </button>
            </form>
          </div>
        )}

        {/* POSTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition border"
            >
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
                <div className="flex justify-between">
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{post.food_type}</h3>
                    <p className="text-sm opacity-90">{post.quantity}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      post.status === "available"
                        ? "bg-white text-green-700"
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
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">
                    {formatTimeRemaining(post.expiry_time)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{post.location}</span>
                </div>

                {post.description && (
                  <p className="text-sm text-gray-700">{post.description}</p>
                )}

                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {post.meals_saved} meals
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Posted by {post.posted_by?.full_name || "Unknown"}
                  </p>
                </div>

                {/* NGO Claim */}
                {user.role === "ngo" && post.status === "available" && (
                  <button
                    onClick={() => handleClaim(post._id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg mt-3 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Claim Pickup
                  </button>
                )}

                {/* Owner edit/delete */}
                {post.posted_by?._id === user._id && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => startEdit(post)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(post._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No food posts yet
            </h3>
            <p className="text-gray-500">
              {user.role === "mess_staff"
                ? "Post surplus food to get started"
                : "Check back later for available food"}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
