// src/pages/LeaderboardPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { Trophy, User, ArrowUp } from "lucide-react";

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchLeaderboard();
  }, [authLoading, user?.token]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/leaderboard?limit=20");

      // SAFER: check if backend returned a valid array
      const list = res.data?.data;
      setLeaders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Leaderboard load error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="pt-24 text-center">Checking authentication...</div>;
  if (!user?.token) return <div className="pt-24 text-center">Please log in to view the leaderboard.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-sm text-gray-600">Top volunteers by points — great job everyone 🎉</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-1/6 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-6">{error}</div>
          ) : leaders.length === 0 ? (
            <div className="text-center text-gray-600 py-6">No leaderboard data yet.</div>
          ) : (
            <ol className="divide-y">
              {leaders.map((u, idx) => (
                <li key={u._id || u.id} className="flex items-center justify-between py-3 px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {idx + 1}. {u.full_name}
                        </span>

                        {idx === 0 && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Top</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{u.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{u.volunteer_points || 0}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                    <div className="text-green-500">
                      <ArrowUp className="w-5 h-5" />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
