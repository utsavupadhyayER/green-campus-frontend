// src/pages/DonationsPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import {
  Gift,
  MapPin,
  Plus,
  CheckCircle,
  BookOpen,
  Shirt,
  Pen,
  Laptop,
} from "lucide-react";

export default function DonationsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    item_name: "",
    category: "books",
    condition: "good",
    quantity: 1,
    description: "",
    location: "",
  });

  /* ================================
     FETCH DONATIONS FROM BACKEND
  =================================*/
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/donations");
      // support both { success, data } and older { ... } shapes
      const items = res?.data?.data ?? res?.data ?? [];
      setDonations(items);
    } catch (err) {
      console.error("Error loading donations", err);
      // optionally show toast / message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================
     CREATE DONATION (POST)
  =================================*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post("/donations", formData);
      const created = res?.data?.data ?? res?.data;
      // prepend created donation
      setDonations((prev) => [created, ...prev]);
      setShowForm(false);
      setFormData({
        item_name: "",
        category: "books",
        condition: "good",
        quantity: 1,
        description: "",
        location: "",
      });
    } catch (err) {
      console.error("Error posting donation", err);
      alert(err?.response?.data?.message || "Failed to create donation");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================================
     CLAIM DONATION
     - ask confirmation
     - update list with populated response
  =================================*/
  const handleClaim = async (donationId) => {
    if (!confirm("Claim this item? You will be contacted for pickup details.")) return;
    try {
      const res = await api.patch(`/donations/${donationId}/claim`, {});
      const updated = res?.data?.data ?? res?.data;
      setDonations((prev) => prev.map((item) => (item._id === donationId ? updated : item)));
    } catch (err) {
      console.error("Error claiming item", err);
      alert(err?.response?.data?.message || "Failed to claim item");
    }
  };

  /* ================================
     CATEGORY ICONS & COLORS
  =================================*/
  const getCategoryIcon = (category) => {
    switch (category) {
      case "books":
        return BookOpen;
      case "clothes":
        return Shirt;
      case "stationery":
        return Pen;
      case "electronics":
        return Laptop;
      default:
        return Gift;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "books":
        return "from-blue-500 to-indigo-500";
      case "clothes":
        return "from-violet-500 to-pink-500";
      case "stationery":
        return "from-teal-500 to-cyan-500";
      case "electronics":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  /* ================================
     Small derived stats for header
  =================================*/
  const totalAvailable = donations.filter((d) => d.status === "available").length;
  const totalDonations = donations.length;

  // ---------- Loading skeleton ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 w-2/5 bg-gray-200 rounded animate-pulse" />
            <div className="mt-4 flex gap-3">
              <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
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

  /* ================================
     Main UI (after loading)
  =================================*/
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 sm:pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Donation Center</h1>
            <p className="text-gray-600">Share and claim reusable items within the campus community.</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">{totalDonations} donations</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">{totalAvailable} available</span>
              </div>
            </div>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow transition-transform transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Donate Item
            </button>
          </div>
        </div>

        {/* Donation Form (card) */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Donate an Item</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close form">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="Item Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="books">Books</option>
                  <option value="clothes">Clothes</option>
                  <option value="stationery">Stationery</option>
                  <option value="electronics">Electronics</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>

                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value || "1") })}
                  placeholder="Quantity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />

                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Pickup Location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg md:col-span-2"
                />
              </div>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">
                  {submitting ? "Posting..." : "Post Donation"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Donations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => {
            const CategoryIcon = getCategoryIcon(donation.category);
            const colorClass = getCategoryColor(donation.category);

            return (
              <article
                key={donation._id}
                className="bg-white rounded-2xl shadow hover:shadow-xl border overflow-hidden"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${colorClass} p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="text-white flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-md">
                        <CategoryIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{donation.item_name}</h3>
                        <p className="text-sm opacity-90 capitalize">{donation.category}</p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${donation.status === "available" ? "bg-white text-gray-700" : "bg-yellow-100 text-yellow-800"}`}>
                      {donation.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Qty: {donation.quantity}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${donation.condition === "new" ? "bg-green-100 text-green-700" : donation.condition === "good" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                      {donation.condition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{donation.location}</span>
                  </div>

                  {donation.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{donation.description}</p>
                  )}

                  <p className="text-xs text-gray-500">Donated by {donation.donated_by?.full_name}</p>

                  {/* Claim Button */}
                  {donation.status === "available" && donation.donated_by?._id !== user?._id && (
                    <button
                      onClick={() => handleClaim(donation._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Claim Item
                    </button>
                  )}

                  {/* Claimed Info */}
                  {donation.status === "claimed" && donation.claimed_by && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">Claimed by {donation.claimed_by.full_name}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {donations.length === 0 && (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No donations yet</h3>
            <p className="text-gray-500">Be the first to share reusable items!</p>
          </div>
        )}
      </div>
    </div>
  );
}
