// 'use client'

// import { useState } from "react";
// import axios from "axios";
// import { FaSearch } from "react-icons/fa";

// export default function AssignTrainerForm() {
//   interface Trainer {
//     _id: string;
//     firstname: string;
//     lastname: string;
//     ptSpecialization?: string;
//     ptExperience?: string;
//   }



//   const [searchQuery, setSearchQuery] = useState("");
//   const [trainerList, setTrainerList] = useState<Trainer[]>([]);
//   const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState("");

//  // Search trainers
// const handleSearch = async () => {
//   if (!searchQuery.trim()) return;

//   try {
//     setLoading(true);
//     const res = await fetch(
//       `http://localhost:5000/user/trainers-search?q=${encodeURIComponent(searchQuery)}`,
//       {
//         method: "GET",
//         credentials: "include", // gửi cookie session
//       }
//     );

//     if (!res.ok) throw new Error("Search failed");

//     const data = await res.json();
//     setTrainerList(data);
//     setLoading(false);
//   } catch (error) {
//     console.error(error);
//     setMessage("Search failed");
//     setLoading(false);
//   }
// };

// // Create relationship (assign PT)
// const assignTrainer = async () => {
//   if (!selectedTrainer) return;

//   // Lấy user info từ localStorage
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   if (!user || !user._id || !user.firstname) {
//     setMessage("User info not found in localStorage");
//     return;
//   }

//   setSubmitting(true);

//   try {
//     const payload = {
//       ptId: selectedTrainer._id,
//       ptName: `${selectedTrainer.firstname} ${selectedTrainer.lastname}`,
//       userId: user._id,
//       userName: `${user.firstname} ${user.lastname}`,
//       status: "pending",
//     };

//     const res = await fetch("http://localhost:5000/user/assign-pt", {
//       method: "POST",
//       credentials: "include", // gửi cookie session
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) throw new Error("Request failed");

//     setMessage("Request Sent Successfully!");
//     setSubmitting(false);
//     setSelectedTrainer(null);
//     setTrainerList([]);
//     setSearchQuery("");
//   } catch (err) {
//     console.error(err);
//     setMessage("Error sending request");
//     setSubmitting(false);
//   }
// };



//   return (
//     <div className="bg-primary-300 border border-primary-100 rounded-xl p-6 text-white">
//       <h2 className="text-2xl font-semibold mb-4">Find Personal Trainer</h2>

//       {/* search input */}
//       <div className="relative mb-4">
//         <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
//         <input
//           type="text"
//           placeholder="Search PT by name..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 border border-primary-100 rounded-md bg-primary-200 text-white placeholder-gray-400"
//         />
//       </div>

//       <button
//         onClick={handleSearch}
//         className="px-4 py-2 bg-accent hover:bg-accent/90 rounded-md text-white"
//         disabled={loading}
//       >
//         {loading ? "Searching..." : "Search"}
//       </button>

//       {/* list trainers */}
//       <div className="mt-6">
//         {trainerList.length > 0 && (
//           <h3 className="mb-3 font-medium">Search Results:</h3>
//         )}

//         {/* {trainerList.length === 0 && !loading && searchQuery && (
//           <p className="text-gray-400">No trainer found</p>
//         )} */}

//         <div className="grid gap-3">
//           {trainerList.map((pt) => (
//             <div
//               key={pt._id}
//               onClick={() => setSelectedTrainer(pt)}
//               className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTrainer?._id === pt._id
//                 ? "border-accent shadow-lg"
//                 : "border-primary-100 hover:border-accent/50"
//                 }`}
//             >
//               <p className="text-lg font-medium">
//                 {pt.firstname} {pt.lastname}
//               </p>
//               <p className="text-gray-300 text-sm">{pt.ptSpecialization || "No specialization"}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* confirm button */}
//       {selectedTrainer && (
//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={assignTrainer}
//             disabled={submitting}
//             className="px-4 py-2 bg-accent hover:bg-accent/90 rounded-md"
//           >
//             {submitting ? "Sending..." : "Send Request"}
//           </button>
//         </div>
//       )}

//       {/* {message && (
//         <p className="mt-4 text-green-400 font-semibold">{message}</p>
//       )} */}
//     </div>
//   );
// }




'use client';

import { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaDumbbell, FaAward, FaUserTie, FaSearch, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";

interface Trainer {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  ptSpecialization?: string;
  ptExperience?: string;
}

export default function AssignTrainerPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // Fetch all PTs
  useEffect(() => {
    const fetchPTs = async () => {
      try {
        const res = await fetch("http://localhost:5000/user/get-pts", {
          credentials: "include",
        });
        const data = await res.json();
        setTrainers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPTs();
  }, []);

  // Filter PTs by name
  const filteredPTs = useMemo(() => {
    return trainers.filter((pt) =>
      `${pt.firstname} ${pt.lastname}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [trainers, search]);

  const handleAssign = async (pt: Trainer) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?._id) {
      setMessage("User not found");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmittingId(pt._id);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/user/assign-pt", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ptId: pt._id,
          userId: user._id,
          ptName: `${pt.firstname} ${pt.lastname}`,
          userName: `${user.firstname} ${user.lastname}`,
          status: "pending",
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setMessage(`✓ Request sent successfully to ${pt.firstname} ${pt.lastname}!`);
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send request. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  // Stats calculation
  const trainerStats = {
    total: trainers.length,
    filtered: filteredPTs.length,
    specializations: [...new Set(trainers.map(t => t.ptSpecialization).filter(Boolean))].length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaUserTie className="text-accent text-4xl" />
              <h1 className="text-4xl font-bold text-white">Professional Trainers</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Find and connect with certified fitness experts
            </p>
          </div>
          <div className="hidden md:block">
            <MdFitnessCenter className="text-accent text-7xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaUserTie className="text-blue-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Total Trainers</h3>
          <p className="text-white text-3xl font-bold">{trainerStats.total}</p>
        </div>

        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaDumbbell className="text-green-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Specializations</h3>
          <p className="text-white text-3xl font-bold">{trainerStats.specializations}</p>
        </div>

        <div className="bg-primary-300 rounded-lg shadow-xl p-6 border border-primary-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <FaSearch className="text-purple-400 text-3xl" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Search Results</h3>
          <p className="text-white text-3xl font-bold">{trainerStats.filtered}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-6">
          <FaSearch className="text-accent text-2xl" />
          <h2 className="text-2xl font-bold text-white">Search Trainers</h2>
        </div>
        
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by trainer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-primary-200 border-2 border-primary-100 text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-all text-lg"
          />
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-xl p-4 border-2 ${
          message.includes('✓') 
            ? 'bg-green-500/10 border-green-500 text-green-400' 
            : 'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {message.includes('✓') && <FaCheckCircle className="text-2xl" />}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-primary-300 rounded-xl shadow-2xl p-12 border border-primary-100 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mb-4"></div>
          <p className="text-gray-400 text-lg">Loading our amazing trainers...</p>
        </div>
      )}

      {/* Trainers List */}
      {!loading && (
        <div className="bg-primary-300 rounded-xl shadow-2xl p-8 border border-primary-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaUserTie className="text-accent text-2xl" />
              <h2 className="text-2xl font-bold text-white">Available Trainers</h2>
            </div>
            <span className="bg-accent/20 text-accent px-4 py-2 rounded-lg font-bold">
              {filteredPTs.length} trainer{filteredPTs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPTs.length === 0 ? (
            <div className="bg-primary-200 p-12 rounded-xl border-2 border-dashed border-primary-100 text-center">
              <FaUserTie className="text-gray-500 text-6xl mx-auto mb-4" />
              <p className="text-gray-400 text-xl mb-2">No trainers found</p>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPTs.map((pt) => {
                const initials =
                  pt.firstname.charAt(0).toUpperCase() +
                  pt.lastname.charAt(0).toUpperCase();

                return (
                  <div
                    key={pt._id}
                    className="bg-primary-200 border border-primary-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Avatar Section */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                          {initials}
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 space-y-4">
                        {/* Name */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {pt.firstname} {pt.lastname}
                          </h3>
                          {pt.ptSpecialization && (
                            <div className="flex items-center gap-2 text-accent">
                              <FaDumbbell />
                              <span className="font-semibold">{pt.ptSpecialization}</span>
                            </div>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Email */}
                          <div className="flex items-center gap-3 bg-primary-300 p-3 rounded-lg">
                            <FaEnvelope className="text-blue-400 text-lg" />
                            <div>
                              <p className="text-gray-400 text-xs">Email</p>
                              <p className="text-white font-medium text-sm">{pt.email}</p>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center gap-3 bg-primary-300 p-3 rounded-lg">
                            <FaPhoneAlt className="text-green-400 text-lg" />
                            <div>
                              <p className="text-gray-400 text-xs">Phone</p>
                              <p className="text-white font-medium text-sm">{pt.phonenumber}</p>
                            </div>
                          </div>

                          {/* Experience */}
                          {pt.ptExperience && (
                            <div className="flex items-center gap-3 bg-primary-300 p-3 rounded-lg">
                              <FaAward className="text-yellow-400 text-lg" />
                              <div>
                                <p className="text-gray-400 text-xs">Experience</p>
                                <p className="text-white font-medium text-sm">{pt.ptExperience}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleAssign(pt)}
                          disabled={submittingId === pt._id}
                          className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                            submittingId === pt._id
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-accent hover:bg-accent/80 hover:shadow-xl hover:scale-105'
                          } text-white`}
                        >
                          {submittingId === pt._id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FaPaperPlane />
                              Send Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
