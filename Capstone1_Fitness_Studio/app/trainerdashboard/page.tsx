"use client";

import { useState, useEffect } from "react";
import { 
  FiUser, 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAward,
  FiActivity,
  FiEdit3,
  FiSave,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";

interface Relationship {
  _id: string;
  ptId: string;
  userId: string;
  ptName: string;
  userName: string;
  status: "pending" | "active" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

interface Schedule {
  _id: string;
  scheduleName: string;
  scheduleDate: string;
  shift: string;
  ptId: string;
  ptName: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface TrainerProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  ptSpecialization: string;
  ptExperience: string;
  ptClients: { userId: string; name: string }[];
}

export default function TrainerDashboard() {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(null);
  const [ptExperience, setExperience] = useState("Senior");
  const [ptSpecialization, setSpecialization] = useState("Calisthenic");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [relationshipList, setRelationshipList] = useState<Relationship[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Load trainer ID from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed?._id) {
          setTrainerId(parsed._id);
        }
      }
    } catch (err) {
      console.error("Failed to read localStorage", err);
    }
  }, []);

  // Fetch all data when trainerId is available
  useEffect(() => {
    if (trainerId) {
      fetchAllData();
    }
  }, [trainerId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTrainerProfile(),
      fetchRelationships(),
      fetchSchedules()
    ]);
    setLoading(false);
  };

  const fetchTrainerProfile = async () => {
    if (!trainerId) return;
    try {
      const res = await fetch(`http://localhost:5000/user/trainer/${trainerId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTrainerProfile(data);
        setExperience(data.ptExperience || "Senior");
        setSpecialization(data.ptSpecialization || "Calisthenic");
      }
    } catch (err) {
      console.error("Error fetching trainer profile:", err);
    }
  };

  const fetchRelationships = async () => {
    if (!trainerId) return;
    try {
      const res = await fetch(`http://localhost:5000/pt/relationships/${trainerId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRelationshipList(data);
      }
    } catch (err) {
      console.error("Error fetching relationships:", err);
    }
  };

  const fetchSchedules = async () => {
    if (!trainerId) return;
    try {
      const res = await fetch(`http://localhost:5000/schedule/trainer/${trainerId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/pt/assign-pt/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Approve failed");
      setMessage({ type: "success", text: "Client request approved!" });
      fetchRelationships();
      fetchTrainerProfile();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error approving request" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/pt/assign-pt/${id}/reject`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Reject failed");
      setMessage({ type: "success", text: "Client request rejected" });
      fetchRelationships();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error rejecting request" });
    }
  };

  const updateTrainer = async () => {
    if (!trainerId) return;

    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:5000/pt/update-profile/${trainerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ptExperience, ptSpecialization }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        fetchTrainerProfile();
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Calculate stats
  const stats = {
    totalClients: trainerProfile?.ptClients?.length || 0,
    pendingRequests: relationshipList.filter(r => r.status === "pending").length,
    activeClients: relationshipList.filter(r => r.status === "active").length,
    upcomingSchedules: schedules.length
  };

  const pendingRequests = relationshipList.filter(r => r.status === "pending");
  const todaySchedules = schedules.slice(0, 3); // Show first 3

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiActivity className="text-accent" />
            Trainer Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {trainerProfile?.firstname} {trainerProfile?.lastname}
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-green-500/20 border border-green-500/30 text-green-400"
            : "bg-red-500/20 border border-red-500/30 text-red-400"
        }`}>
          {message.type === "success" ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-5 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-xl">
              <FiUsers className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-2xl p-5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-xl">
              <FiClock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl p-5 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <FiCheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Clients</p>
              <p className="text-2xl font-bold text-white">{stats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <FiCalendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Schedules</p>
              <p className="text-2xl font-bold text-white">{stats.upcomingSchedules}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-primary-300 rounded-2xl p-6 border border-primary-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiUser className="text-accent" />
              My Profile
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-primary-200 rounded-lg transition-colors text-gray-400 hover:text-accent"
              >
                <FiEdit3 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={updateTrainer}
                disabled={updating}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors text-sm"
              >
                <FiSave className="w-4 h-4" />
                {updating ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {trainerProfile?.firstname?.[0]}{trainerProfile?.lastname?.[0]}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {trainerProfile?.firstname} {trainerProfile?.lastname}
              </p>
              <p className="text-sm text-gray-400">{trainerProfile?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Experience Level</label>
              {isEditing ? (
                <select
                  value={ptExperience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-primary-200 p-3 rounded-xl border border-primary-100 text-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="Senior">Senior</option>
                  <option value="Professional">Professional</option>
                  <option value="Veteran">Veteran</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-primary-200 rounded-xl">
                  <FiAward className="text-accent" />
                  <span className="text-white">{trainerProfile?.ptExperience || ptExperience}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Specialization</label>
              {isEditing ? (
                <select
                  value={ptSpecialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-primary-200 p-3 rounded-xl border border-primary-100 text-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="Calisthenic">Calisthenic</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Athlete">Athlete</option>
                  <option value="GYM">GYM</option>
                  <option value="Sport">Sport</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-primary-200 rounded-xl">
                  <FiActivity className="text-accent" />
                  <span className="text-white">{trainerProfile?.ptSpecialization || ptSpecialization}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Pending Requests */}
        <div className="bg-primary-300 rounded-2xl p-6 border border-primary-100">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <FiClock className="text-yellow-400" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <FiCheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pendingRequests.map((rel) => (
                <div
                  key={rel._id}
                  className="p-4 bg-primary-200 rounded-xl border border-primary-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <FiUser className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{rel.userName}</p>
                      <p className="text-xs text-gray-400">
                        {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(rel._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(rel._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <FiXCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-primary-300 rounded-2xl p-6 border border-primary-100">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <FiCalendar className="text-blue-400" />
            Training Sessions
          </h2>

          {todaySchedules.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No scheduled sessions</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todaySchedules.map((slot) => (
                <div
                  key={slot._id}
                  className="p-4 bg-primary-200 rounded-xl border border-primary-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-accent">
                      {slot.scheduleDate}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      {slot.shift}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{slot.userName}</p>
                      <p className="text-xs text-gray-400">Client</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {schedules.length > 3 && (
            <a
              href="/trainerdashboard/schedule"
              className="block mt-4 text-center text-accent hover:text-accent/80 text-sm transition-colors"
            >
              View all {schedules.length} sessions →
            </a>
          )}
        </div>
      </div>

      {/* Recent Clients Section */}
      <div className="mt-8 bg-primary-300 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUsers className="text-accent" />
            Active Clients
          </h2>
          <a
            href="/trainerdashboard/clients"
            className="text-accent hover:text-accent/80 text-sm transition-colors"
          >
            View all →
          </a>
        </div>

        {relationshipList.filter(r => r.status === "active").length === 0 ? (
          <div className="text-center py-8">
            <FiUsers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active clients yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relationshipList
              .filter(r => r.status === "active")
              .slice(0, 4)
              .map((rel) => (
                <div
                  key={rel._id}
                  className="p-4 bg-primary-200 rounded-xl border border-primary-100 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{rel.userName}</p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Active
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
