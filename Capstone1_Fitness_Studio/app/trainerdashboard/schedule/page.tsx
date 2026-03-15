'use client'

import { useEffect, useState } from 'react'
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiRefreshCw,
  FiFilter
} from "react-icons/fi";

interface ScheduleSlot {
  _id: string;
  scheduleName: string;
  scheduleDate: string;
  shift: string;
  ptId: string;
  ptName: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

const SHIFT_CONFIG: { [key: string]: { color: string; bgColor: string; time: string } } = {
  "Morning": { color: "text-yellow-400", bgColor: "bg-yellow-500/20", time: "6:00 - 12:00" },
  "Afternoon": { color: "text-orange-400", bgColor: "bg-orange-500/20", time: "12:00 - 18:00" },
  "Evening": { color: "text-purple-400", bgColor: "bg-purple-500/20", time: "18:00 - 22:00" }
};

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterShift, setFilterShift] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("You are not logged in.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser._id;

      setLoading(true);
      setError("");

      const res = await fetch(`http://localhost:5000/schedule/trainer/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await res.json();
      setSchedule(data);
    } catch (err: unknown) {
      console.error("Error fetching schedules:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error fetching schedules");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter schedules
  const filteredSchedules = schedule.filter(slot => {
    const matchesShift = filterShift === "all" || slot.shift === filterShift;
    const matchesDate = !filterDate || slot.scheduleDate.includes(filterDate);
    return matchesShift && matchesDate;
  });

  // Group schedules by date
  const groupedSchedules = filteredSchedules.reduce((acc, slot) => {
    const date = slot.scheduleDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as { [key: string]: ScheduleSlot[] });

  // Sort dates
  const sortedDates = Object.keys(groupedSchedules).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Stats
  const stats = {
    total: schedule.length,
    morning: schedule.filter(s => s.shift === "Morning").length,
    afternoon: schedule.filter(s => s.shift === "Afternoon").length,
    evening: schedule.filter(s => s.shift === "Evening").length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading schedule...</p>
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
            <FiCalendar className="text-accent" />
            Training Schedule
          </h1>
          <p className="text-gray-400 mt-1">View your upcoming training sessions</p>
        </div>
        <button
          onClick={fetchSchedules}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-5 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-xl">
              <FiCalendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-2xl p-5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-xl">
              <FiClock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Morning</p>
              <p className="text-2xl font-bold text-white">{stats.morning}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl p-5 border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-3 rounded-xl">
              <FiClock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Afternoon</p>
              <p className="text-2xl font-bold text-white">{stats.afternoon}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-3 rounded-xl">
              <FiClock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Evening</p>
              <p className="text-2xl font-bold text-white">{stats.evening}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-primary-300 rounded-2xl p-4 mb-6 border border-primary-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Date Filter */}
          <div className="flex-1 relative">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          {/* Shift Filter */}
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="pl-11 pr-8 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all min-w-[180px]"
            >
              <option value="all">All Shifts</option>
              <option value="Morning">Morning (6:00-12:00)</option>
              <option value="Afternoon">Afternoon (12:00-18:00)</option>
              <option value="Evening">Evening (18:00-22:00)</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(filterDate || filterShift !== "all") && (
            <button
              onClick={() => { setFilterDate(""); setFilterShift("all"); }}
              className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-400 mb-4">
        Showing <span className="text-white font-medium">{filteredSchedules.length}</span> sessions
      </p>

      {/* Schedule List */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-primary-300 rounded-2xl p-12 text-center border border-primary-100">
          <FiCalendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No scheduled sessions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <FiCalendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {groupedSchedules[date].length} session{groupedSchedules[date].length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Sessions for this date */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-11">
                {groupedSchedules[date].map((slot) => {
                  const shiftConfig = SHIFT_CONFIG[slot.shift] || SHIFT_CONFIG["Morning"];

                  return (
                    <div
                      key={slot._id}
                      className="bg-primary-300 rounded-2xl p-5 border border-primary-100 hover:border-accent/30 transition-all"
                    >
                      {/* Shift Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 ${shiftConfig.bgColor} ${shiftConfig.color} text-sm font-medium rounded-full`}>
                          {slot.shift}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <FiClock className="w-4 h-4" />
                          {shiftConfig.time}
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{slot.userName}</p>
                          <p className="text-xs text-gray-400">Client</p>
                        </div>
                      </div>

                      {/* Session Name */}
                      <div className="mt-4 pt-4 border-t border-primary-100">
                        <p className="text-sm text-gray-400">Session</p>
                        <p className="text-white">{slot.scheduleName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
