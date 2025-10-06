import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gift, MapPin, Plus, CheckCircle, BookOpen, Shirt, Pen, Laptop } from 'lucide-react';
import { mockDonations } from '../lib/mockData';

export default function DonationsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [donations, setDonations] = useState(mockDonations);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'books',
    condition: 'good',
    quantity: 1,
    description: '',
    location: '',
  });

  // Handle donation submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newDonation = {
      id: Date.now().toString(),
      donated_by: user.id,
      ...formData,
      status: 'available',
      created_at: new Date().toISOString(),
      donor: user,
    };
    setDonations([newDonation, ...donations]);
    setFormData({
      item_name: '',
      category: 'books',
      condition: 'good',
      quantity: 1,
      description: '',
      location: '',
    });
    setShowForm(false);
  };

  // Handle claim action
  const handleClaim = (donationId) => {
    setDonations(
      donations.map((donation) =>
        donation.id === donationId
          ? { ...donation, status: 'claimed', claimed_by: user.id, claimer: user }
          : donation
      )
    );
  };

  // Category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'books': return BookOpen;
      case 'clothes': return Shirt;
      case 'stationery': return Pen;
      case 'electronics': return Laptop;
      default: return Gift;
    }
  };

  // Category gradients
  const getCategoryColor = (category) => {
    switch (category) {
      case 'books': return 'from-blue-500 to-indigo-500';
      case 'clothes': return 'from-violet-500 to-pink-500';
      case 'stationery': return 'from-teal-500 to-cyan-500';
      case 'electronics': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-1">Donation Center</h1>
            <p className="text-gray-600">Share and claim reusable items with the campus community</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all"
          >
            <Plus className="w-5 h-5" /> Donate Item
          </button>
        </div>

        {/* Donation Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Donate an Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="Item Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  placeholder="Quantity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Pickup Location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all">
                  Post Donation
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Donations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => {
            const CategoryIcon = getCategoryIcon(donation.category);
            const colorClass = getCategoryColor(donation.category);
            return (
              <div key={donation.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden">
                <div className={`bg-gradient-to-r ${colorClass} p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="text-white flex items-center gap-3">
                      <CategoryIcon className="w-8 h-8" />
                      <div>
                        <h3 className="text-xl font-bold mb-1">{donation.item_name}</h3>
                        <p className="text-sm opacity-90 capitalize">{donation.category}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      donation.status === 'available'
                        ? 'bg-white text-gray-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Qty: {donation.quantity}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      donation.condition === 'new' ? 'bg-green-100 text-green-700'
                      : donation.condition === 'good' ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}>{donation.condition}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{donation.location}</span>
                  </div>
                  {donation.description && <p className="text-sm text-gray-600 line-clamp-2">{donation.description}</p>}
                  <p className="text-xs text-gray-500">Donated by {donation.donor?.full_name}</p>

                  {donation.status === 'available' && donation.donated_by !== user?.id && (
                    <button
                      onClick={() => handleClaim(donation.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Claim Item
                    </button>
                  )}

                  {donation.status === 'claimed' && donation.claimer && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">Claimed by {donation.claimer.full_name}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {donations.length === 0 && (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No donations yet</h3>
            <p className="text-gray-500">Be the first to share reusable items with the community!</p>
          </div>
        )}

      </div>
    </div>
  );
}
