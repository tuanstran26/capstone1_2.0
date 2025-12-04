'use client'

import { useEffect, useState } from 'react'
import { FaClock, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
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
  return (
    <div className="text-white">


      <h2 className="text-3xl font-bold mb-6 text-white">Create Training Schedule</h2>

      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
      {successMsg && <p className="text-green-500 mb-2">{successMsg}</p>}

      {user && pt && (
        <div className="space-y-4">
          <div className="text-gray-300">
            <p>User: <span className="text-white font-medium">{user.firstname} {user.lastname}</span></p>
            <p>Your Trainer: <span className="text-white font-medium">{pt.firstname} {pt.lastname}</span></p>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col">
            <label className="mb-2 text-gray-300 font-medium">Select date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>

          {/* Shift select */}
          <div className="flex flex-col">
            <label className="mb-2 text-gray-300 font-medium">Select training shift:</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent transition"
            >
              <option value="" disabled>-- Select shift --</option>
              {shifts.map((s) => (
                <option key={s} value={s} className="bg-gray-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={submitSchedule}
            className="mt-4 px-6 py-2 bg-accent text-white font-semibold rounded-lg shadow hover:bg-accent/80 transition"
          >
            Create Schedule
          </button>
        </div>
      )}


      {/* # Display schedule */}
      <h1 className="text-3xl font-bold mb-4 text-white">Your Schedule</h1>
      <p className="text-gray-300 mb-6">Training sessions & bookings</p>

      {loading2 && <p className="text-gray-400">Loading schedule...</p>}

      {!loading2 && schedule.length === 0 && (
        <div className="bg-primary-300 p-6 rounded-xl border border-primary-200 text-center">
          <p className="text-gray-300">No schedule found.</p>
        </div>
      )}

      {errorMsg2 && <p className="text-red-500 mb-2">{errorMsg2}</p>}

      <div className="space-y-4">
        {schedule.map((slot, index) => (

          <div
            key={index}
            className="bg-primary-300 p-4 rounded-lg border border-primary-100 flex justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-white" />
                <span className="font-medium text-white">
                  {slot.scheduleName.split(" ")[0]}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-1 text-gray-300">
                <FaClock />
                <span>{slot.shift}</span>
              </div>

              {slot.userName && (
                <p className="mt-2 text-sm text-white">
                  Trainer: {slot.ptName}
                </p>
              )}
            </div>

            <div>
              {slot.status === "pending" && (
                <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm">
                  Pending
                </span>
              )}
              {slot.status === "active" && (
                <span className="px-3 py-1 bg-green-500 rounded-full text-sm flex items-center">
                  <FaCheckCircle className="mr-1" /> Active
                </span>
              )}
              {slot.status === "rejected" && (
                <span className="px-3 py-1 bg-red-500 rounded-full text-sm">
                  Rejected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
