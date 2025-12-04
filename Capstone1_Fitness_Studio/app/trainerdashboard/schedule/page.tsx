'use client'

import { useEffect, useState } from 'react'
import { FaClock, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';



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


  useEffect(() => {
    console.log("Running fetchProfile useEffect");
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setErrorMsg("You are not logged in.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser._id;
      console.log("Fetched userId from localStorage:", userId);
      setLoading2(true);
      setErrorMsg2("");

      const res = await fetch(`http://localhost:5000/schedule/trainer/${userId}`, {
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
                  Client: {slot.userName}
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
