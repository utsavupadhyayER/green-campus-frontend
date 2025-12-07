// src/pages/VolunteersPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Plus,
  UserPlus,
  CheckCircle,
  Trash2,
} from "lucide-react";

export default function VolunteersPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "food_drive",
    location: "",
    event_date: "",
    duration_hours: 2,
    max_volunteers: 50,
    points_reward: 10,
  });

  // dynamic nav height
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

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/volunteers");
      const payload = res.data ?? [];
      setEvents(Array.isArray(payload) ? payload : (payload.data || payload));
    } catch (err) {
      console.error("Failed to load events", err);
      setError(err?.response?.data?.message || err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const canCreate = user?.role === "ngo" || isAdmin;

  const idOf = (ev) => ev._id || ev.id;

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        duration_hours: Number(formData.duration_hours || 0),
        max_volunteers: Number(formData.max_volunteers || 0),
        points_reward: Number(formData.points_reward || 0),
      };

      const res = await api.post("/volunteers", payload);
      const created = res.data ?? res.data?.data;
      setEvents((prev) => [created, ...prev]);
      setShowForm(false);

      setFormData({
        title: "",
        description: "",
        event_type: "food_drive",
        location: "",
        event_date: "",
        duration_hours: 2,
        max_volunteers: 50,
        points_reward: 10,
      });
    } catch (err) {
      console.error("Create event error", err);
      setError(err?.response?.data?.message || err.message || "Failed to create event");
      alert(err?.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      alert("Please login to register");
      return;
    }

    try {
      const res = await api.post(`/volunteers/${eventId}/register`);
      const payload = res.data?.data ?? res.data;
      setEvents((prev) => prev.map((ev) => (idOf(ev) === eventId ? payload : ev)));
    } catch (err) {
      console.error("Register error", err);
      alert(err?.response?.data?.message || err.message || "Failed to register");
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;

    try {
      await api.delete(`/volunteers/${eventId}`);
      setEvents((prev) => prev.filter((ev) => idOf(ev) !== eventId));
    } catch (err) {
      console.error("Delete error", err);
      alert(err?.response?.data?.message || err.message || "Failed to delete event");
    }
  };

  // FIXED HERE ⭐ reload events after marking complete
  const handleMarkComplete = async (eventId) => {
    if (!confirm("Mark this event as completed and award points to participants?")) return;

    try {
      await api.post(`/volunteers/${eventId}/complete`);
      await fetchEvents();
      alert("Event marked completed and points awarded.");
    } catch (err) {
      console.error("Complete error", err);
      alert(err?.response?.data?.message || err.message || "Failed to mark complete");
    }
  };

  const userIsRegistered = (ev) => {
    const userId = user?._id || user?.id;
    if (!userId) return false;

    const regs = ev.registered || ev.registered_users || [];
    return regs.some((r) => {
      if (!r) return false;
      if (r.user) {
        const uid = r.user._id || r.user;
        return uid?.toString() === userId?.toString();
      }
      if (r._id) return r._id?.toString() === userId?.toString();
      return r.toString() === userId?.toString();
    });
  };

  const isOrganizer = (ev) => {
    const userId = user?._id || user?.id;
    const creatorId = ev.created_by?._id || ev.created_by;
    if (!userId) return false;
    if (isAdmin) return true;
    return creatorId?.toString() === userId?.toString();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8"
        style={{ paddingTop: navHeight || 64 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="mt-4 flex gap-3">
              <div className="h-10 w-44 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-44 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl shadow border">
                <div className="h-40 bg-gray-100 rounded mb-4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 pb-12 relative z-0"
      style={{ paddingTop: navHeight || 64 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Volunteer Events</h1>
            <p className="text-gray-600">
              Create, join, and complete volunteer opportunities to earn points.
            </p>
          </div>

          {canCreate && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          )}
        </div>

        {/* create form */}
        {showForm && canCreate && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Create Volunteer Event
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-3 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <select
                  value={formData.event_type}
                  onChange={(e) =>
                    setFormData({ ...formData, event_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="food_drive">Food Drive</option>
                  <option value="ewaste_cleanup">E-Waste Cleanup</option>
                  <option value="awareness">Awareness Workshop</option>
                  <option value="tree_planting">Tree Planting</option>
                  <option value="other">Other</option>
                </select>

                <input
                  required
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  required
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) =>
                    setFormData({ ...formData, event_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="number"
                  min="1"
                  placeholder="Duration (hours)"
                  value={formData.duration_hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_hours: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="number"
                  min="1"
                  placeholder="Max volunteers"
                  value={formData.max_volunteers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_volunteers: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Points reward"
                  value={formData.points_reward}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_reward: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <textarea
                placeholder="Description"
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  disabled={submitting}
                  type="submit"
                  className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  {submitting ? "Creating..." : "Create Event"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 rounded-lg border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((ev) => {
            const eventId = idOf(ev);
            const full =
              (ev.registered_count || 0) >= (ev.max_volunteers || Infinity);
            const registered = userIsRegistered(ev);
            const organizer = isOrganizer(ev);

            return (
              <article
                key={eventId}
                className="bg-white rounded-xl shadow-md hover:shadow-xl border overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <div className="flex justify-between items-start">
                    <div className="text-white flex-1">
                      {/* FIXED TITLE + COMPLETED BADGE */}
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        {ev.title}
                        {ev.status === "completed" && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                            Completed
                          </span>
                        )}
                      </h3>

                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20">
                        {(ev.event_type || "other")
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-white/20 rounded-lg px-4 py-2 border border-white/30 text-white text-center">
                      <Award className="w-6 h-6 mx-auto mb-1" />
                      <div className="font-bold">
                        {ev.points_reward || 0}
                      </div>
                      <div className="text-xs">points</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {ev.description && (
                    <p className="text-gray-600">{ev.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-semibold">
                          {ev.event_date
                            ? new Date(ev.event_date).toLocaleDateString()
                            : "Date TBD"}
                        </p>
                        <p className="text-xs">
                          {ev.event_date
                            ? new Date(ev.event_date).toLocaleTimeString()
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-semibold">
                          {ev.registered_count || 0} /{" "}
                          {ev.max_volunteers || "-"}
                        </p>
                        <p className="text-xs">volunteers</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-sm">
                      {ev.location || "Location TBD"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Organized by {ev.created_by?.full_name || "Unknown"}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* STUDENT ACTIONS — ONLY IF NOT COMPLETED */}
                      {isStudent &&
                        ev.status !== "completed" &&
                        ev.status === "upcoming" &&
                        (registered ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="text-green-700 font-semibold text-sm">
                              Registered
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(eventId)}
                            disabled={full}
                            className={`py-2 px-4 rounded-lg font-semibold ${
                              full
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-orange-600 text-white hover:bg-orange-700"
                            }`}
                          >
                            <UserPlus className="w-4 h-4 inline-block mr-2" />
                            {full ? "Event Full" : "Register"}
                          </button>
                        ))}

                      {/* ORGANIZER BUTTONS — ONLY IF NOT COMPLETED */}
                      {organizer && ev.status !== "completed" && (
                        <>
                          <button
                            onClick={() => handleMarkComplete(eventId)}
                            className="py-2 px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                          >
                            Mark Complete
                          </button>

                          <button
                            onClick={() => handleDelete(eventId)}
                            className="py-2 px-3 rounded-lg bg-red-100 text-red-700 border border-red-200 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {events.length === 0 && !loading && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No events yet
            </h3>
            <p className="text-gray-500">
              Create the first event to get volunteers involved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
