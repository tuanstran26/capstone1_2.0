'use client'

import { useEffect, useState } from 'react'
import { FaClock, FaCalendarAlt, FaCheckCircle, FaUserTie, FaDumbbell, FaTimes, FaHourglassHalf, FaUser } from "react-icons/fa";
import { MdSchedule } from "react-icons/md";
import { useRouter } from 'next/navigation';

interface ScheduleSlot {
  date: string;
  startTime: string;
  endTime: string;
  clientName?: string;
  status: string; // booked | available | completed
}

const shifts = [
  "07:00 to 09:00",
  "09:00 to 11:00",
  "13:00 to 15:00",
  "15:00 to 17:00",
  "17:00 to 19:00",
];

export default function SchedulePage() {


  interface ScheduleSlot {
    _id: string;
    scheduleName: string;
    scheduleDate: string; // ISO string
    shift: string;
    ptId: string;
    ptName: string;
    userId: string;
    userName: string;
    createdAt: string;
    updatedAt: string;
    status?: "pending" | "active" | "rejected"; // nếu có
  }


  const [user, setUser] = useState<any>(null);
  const [pt, setPT] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const router = useRouter();
  const [errorMsg2, setErrorMsg2] = useState("");


  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    console.log("Running fetchProfile useEffect");
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log("Starting fetchProfile");
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setErrorMsg("You are not logged in.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser._id;
      console.log("Fetched userId from localStorage:", userId);
      // Fetch user info
      const resUser = await fetch(`http://localhost:5000/user/find-user/${userId}`, {
        credentials: "include",
      });
      const userData = await resUser.json();
      console.log("Fetched user data:", userData);
      setUser(userData);

      // If user has no PT assigned
      if (!userData.assignedPT) {
        setErrorMsg("You are not assigned to a trainer. Please register for a trainer first.");
        return;
      }

      // Fetch trainer info
      const resPT = await fetch(
        `http://localhost:5000/user/find-user/${userData.assignedPT}`,
        { credentials: "include" }
      );
      const ptData = await resPT.json();
      console.log("Fetched PT data:", ptData);
      setPT(ptData);
    } catch (e) {
      setErrorMsg("Failed to load profile information.");
    } finally {
      setLoading(false);
    }
  };



  const submitSchedule = async () => {
    if (!selectedDate || !selectedShift) {
      setErrorMsg("Please select both date and shift.");
      return;
    }

    if (!pt) {
      setErrorMsg("Trainer information not found.");
      return;
    }

    const formattedDate = formatDate(selectedDate);

    const body = {
      scheduleDate: formattedDate,
      shift: selectedShift,
      ptId: pt._id,
      ptName: `${pt.firstname} ${pt.lastname}`,
      userId: user._id,
      userName: `${user.firstname} ${user.lastname}`,
    };

    try {
      const res = await fetch("http://localhost:5000/schedule/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to create schedule.");
      } else {
        setSuccessMsg("Schedule successfully created!");
        setErrorMsg("");

        // ✅ Alert success
        alert("Schedule successfully created!");

        // ✅ Refresh page
        fetchSchedules(user._id);
      }
    } catch (e) {
      setErrorMsg("Error sending schedule request.");
    }
  };

  // if (loading) return <p className='text-white'>Loading...</p>;




  useEffect(() => {
    if (user && user._id) {
      fetchSchedules(user._id);
    }
  }, [user]);

  const fetchSchedules = async (userId: string) => {
    try {
      setLoading2(true);
      setErrorMsg2("");

      const res = await fetch(`http://localhost:5000/schedule/user/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await res.json();
      setSchedule(data);
    } catch (err: any) {
      console.error("Error fetching schedules:", err);
      setErrorMsg2(err.message || "Error fetching schedules");
    } finally {
      setLoading2(false);
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <FaCheckCircle className="text-white" />;
      case 'pending':
        return <FaHourglassHalf className="text-white" />;
      case 'rejected':
        return <FaTimes className="text-white" />;
      default:
        return null;
    }
  };

  // Calculate schedule stats
  const scheduleStats = {
    total: schedule.length,
    active: schedule.filter(s => s.status === 'active').length,
    pending: schedule.filter(s => s.status === 'pending').length,
    rejected: schedule.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MdSchedule className="text-accent text-4xl" />
              <h1 className="text-4xl font-bold text-white">Training Schedule</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Manage your training sessions and bookings
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {schedule.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <FaCalendarAlt className="text-blue-400 text-3xl" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Sessions</h3>
            <p className="text-white text-3xl font-bold">{scheduleStats.total}</p>
          </div>

          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <FaCheckCircle className="text-green-400 text-3xl" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Active</h3>
            <p className="text-white text-3xl font-bold">{scheduleStats.active}</p>
          </div>

          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <FaHourglassHalf className="text-yellow-400 text-3xl" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Pending</h3>
            <p className="text-white text-3xl font-bold">{scheduleStats.pending}</p>
          </div>

          <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <FaTimes className="text-red-400 text-3xl" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Rejected</h3>
            <p className="text-white text-3xl font-bold">{scheduleStats.rejected}</p>
          </div>
        </div>
      )}

      {/* Create New Schedule Section */}
      <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-6">
          <FaDumbbell className="text-accent text-2xl" />
          <h2 className="text-2xl font-bold text-white">Book New Training Session</h2>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
            {successMsg}
          </div>
        )}

        {user && pt && (
          <div className="space-y-6">
            {/* User & Trainer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-200 p-4 rounded-lg border border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className="text-accent" />
                  <span className="text-gray-400 text-sm">Your Name</span>
                </div>
                <p className="text-white font-semibold text-lg">
                  {user.firstname} {user.lastname}
                </p>
              </div>

              <div className="bg-primary-200 p-4 rounded-lg border border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <FaUserTie className="text-accent" />
                  <span className="text-gray-400 text-sm">Your Trainer</span>
                </div>
                <p className="text-white font-semibold text-lg">
                  {pt.firstname} {pt.lastname}
                </p>
              </div>
            </div>

            {/* Date and Shift Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="flex flex-col">
                <label className="mb-3 text-white font-semibold flex items-center gap-2">
                  <FaCalendarAlt className="text-accent" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-primary-200 text-white border-2 border-primary-100 focus:outline-none focus:border-accent transition-all"
                />
              </div>

              {/* Shift Select */}
              <div className="flex flex-col">
                <label className="mb-3 text-white font-semibold flex items-center gap-2">
                  <FaClock className="text-accent" />
                  Select Time Slot
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-primary-200 text-white border-2 border-primary-100 focus:outline-none focus:border-accent transition-all"
                >
                  <option value="" disabled>-- Choose your time slot --</option>
                  {shifts.map((s) => (
                    <option key={s} value={s} className="bg-primary-200 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={submitSchedule}
              className="w-full md:w-auto px-8 py-3 bg-accent hover:bg-accent/80 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              Book Training Session
            </button>
          </div>
        )}

        {!user && loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading your information...</p>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-6">
          <FaCalendarAlt className="text-accent text-2xl" />
          <h2 className="text-2xl font-bold text-white">Your Training Sessions</h2>
        </div>

        {loading2 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading your schedule...</p>
          </div>
        )}

        {!loading2 && schedule.length === 0 && (
          <div className="bg-primary-200 p-8 rounded-xl border-2 border-dashed border-primary-100 text-center">
            <FaCalendarAlt className="text-gray-500 text-5xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No training sessions scheduled yet.</p>
            <p className="text-gray-500 text-sm mt-2">Book your first session above to get started!</p>
          </div>
        )}

        {errorMsg2 && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {errorMsg2}
          </div>
        )}

        <div className="space-y-4">
          {schedule.map((slot, index) => (
            <div
              key={index}
              className="bg-primary-200 rounded-lg border border-primary-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Side - Session Info */}
                <div className="flex-1 space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <FaCalendarAlt className="text-accent text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Session Date</p>
                      <p className="text-white font-bold text-lg">
                        {slot.scheduleName.split(" ")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FaClock className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Time Slot</p>
                      <p className="text-white font-semibold">{slot.shift}</p>
                    </div>
                  </div>

                  {/* Trainer */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FaUserTie className="text-purple-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Trainer</p>
                      <p className="text-white font-semibold">{slot.ptName}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Status Badge */}
                <div className="flex items-center justify-center md:justify-end">
                  <div className={`${getStatusColor(slot.status || 'pending')} px-6 py-3 rounded-xl shadow-lg flex items-center gap-2`}>
                    {getStatusIcon(slot.status || 'pending')}
                    <span className="text-white font-bold capitalize">
                      {slot.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
