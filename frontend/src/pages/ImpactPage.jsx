// src/pages/ImpactPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { Globe, Package, Heart, Recycle, TrendingUp, ArrowUp } from "lucide-react";

export default function ImpactPage() {
  const { user, loading: authLoading } = useAuth();

  const [navHeight, setNavHeight] = useState(0);
  const [impact, setImpact] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // keep layout below fixed navbar
  useEffect(() => {
    const calc = () => {
      const nav = document.querySelector("nav");
      if (nav && nav.offsetHeight) setNavHeight(nav.offsetHeight);
      else setNavHeight(64); // fallback
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        // impact endpoint is protected in your backend; ensure user token is set via AuthContext
        const [impactRes, globalRes] = await Promise.all([
          api.get("/impact"),
          api.get("/global-stats"),
        ]);
        if (cancelled) return;

        // normalize responses (support different backend shapes)
        const impactData = impactRes?.data?.data || impactRes?.data || impactRes?.data;
        setImpact(impactData);

        const globalPayload = globalRes?.data?.data || globalRes?.data || globalRes?.data;
        // convert array like [{data_type, value}] into object for easy lookup
        if (Array.isArray(globalPayload)) {
          const obj = {};
          globalPayload.forEach((it) => {
            if (it?.data_type) obj[it.data_type] = it.value ?? it.val ?? it.value;
            else if (it?.key) obj[it.key] = it.value;
          });
          setGlobalStats(obj);
        } else if (typeof globalPayload === "object" && globalPayload !== null) {
          setGlobalStats(globalPayload);
        } else {
          setGlobalStats(null);
        }
      } catch (e) {
        console.error("Impact load error:", e);
        setErr(e?.response?.data?.message || e.message || "Failed to load impact data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // only fetch when auth finished (because /api/impact is protected)
    if (!authLoading) {
      // if route is public, this condition doesn't hurt
      load();
    }

    return () => { cancelled = true; };
  }, [authLoading]);

  const formatLargeNumber = (num) => {
    if (num == null) return "0";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  // fallback values if backend not ready
  const globalFoodWaste = globalStats?.food_waste ?? globalStats?.foodWaste ?? 1300000000;
  const hungerDeaths = globalStats?.hunger_deaths ?? globalStats?.hungerDeaths ?? 9000000;
  const ewastePollution = globalStats?.ewaste_pollution ?? globalStats?.ewastePollution ?? 53600000;

  if (authLoading) {
    return (
      <div style={{ paddingTop: navHeight || 64 }} className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // You can optionally block unauthenticated users if /api/impact is protected:
  if (!user?.token) {
    return (
      <div style={{ paddingTop: navHeight || 64 }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Please log in to view impact data.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: navHeight || 64 }} className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Impact Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Track our campus impact and compare with global data</p>
            </div>
          </div>
        </div>

        {/* loading / error */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow animate-pulse h-40" />
              ))}
            </div>
          </div>
        ) : err ? (
          <div className="bg-red-50 text-red-700 p-4 rounded">{err}</div>
        ) : (
          <>
            {/* Live Global Stats */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow p-6 mb-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-xl p-5">
                  <Package className="w-10 h-10 mb-3 opacity-90" />
                  <p className="text-sm opacity-80">Annual Global Food Waste</p>
                  <p className="text-2xl font-bold mt-2">{formatLargeNumber(globalFoodWaste)}</p>
                  <p className="text-xs opacity-70 mt-1">tons per year</p>
                </div>
                <div className="bg-white/10 rounded-xl p-5">
                  <Heart className="w-10 h-10 mb-3 opacity-90" />
                  <p className="text-sm opacity-80">Annual Hunger Deaths</p>
                  <p className="text-2xl font-bold mt-2">{formatLargeNumber(hungerDeaths)}</p>
                  <p className="text-xs opacity-70 mt-1">deaths per year</p>
                </div>
                <div className="bg-white/10 rounded-xl p-5">
                  <Recycle className="w-10 h-10 mb-3 opacity-90" />
                  <p className="text-sm opacity-80">Annual E-Waste Pollution</p>
                  <p className="text-2xl font-bold mt-2">{formatLargeNumber(ewastePollution)}</p>
                  <p className="text-xs opacity-70 mt-1">tons CO₂ per year</p>
                </div>
              </div>
            </div>

            {/* Campus Stats */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Campus Impact Statistics</h2>
                <div className="text-sm text-gray-500">Last updated: {impact?.updatedAt ? new Date(impact.updatedAt).toLocaleDateString() : "—"}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{impact?.total_meals_saved ?? 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Meals Saved</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">{Number(impact?.total_food_waste_kg ?? 0).toFixed(0)}</p>
                  <p className="text-xs text-gray-600 mt-1">Food Waste (kg)</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-2xl font-bold text-orange-700">{impact?.total_ewaste_items ?? 0}</p>
                  <p className="text-xs text-gray-600 mt-1">E-Waste Items</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-2xl font-bold text-teal-700">{Number(impact?.total_co2_saved_kg ?? 0).toFixed(0)}</p>
                  <p className="text-xs text-gray-600 mt-1">CO₂ Saved (kg)</p>
                </div>
                <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-2xl font-bold text-violet-700">{impact?.total_volunteers_active ?? 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Active Volunteers</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-700">{impact?.total_donations ?? 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Donations</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Keep Making a Difference!</h3>
              <p className="opacity-90">
                Together we've saved {impact?.total_meals_saved ?? 0} meals and recycled {impact?.total_ewaste_items ?? 0} electronic items.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
