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
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";

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
      return;
    }

    setSubmittingId(pt._id);

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

      setMessage(`Request sent to ${pt.firstname}`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send request");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-primary-400 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Choose Your Personal Trainer
      </h1>

      {/* Search input */}
      <div className="max-w-3xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search trainer by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-primary-300 border border-primary-100 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {loading && (
        <p className="text-center text-gray-400">Loading trainers...</p>
      )}

      {/* List view */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredPTs.map((pt) => {
          const initials =
            pt.firstname.charAt(0).toUpperCase() +
            pt.lastname.charAt(0).toUpperCase();

          return (
            <div
              key={pt._id}
              className="flex items-center gap-6 bg-primary-300 border border-primary-100 rounded-xl p-6 hover:shadow-xl transition-all"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-xl font-semibold">
                  {pt.firstname} {pt.lastname}
                </p>
                <p className="text-gray-400 mb-2">
                  {pt.ptSpecialization || "No specialization"}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaEnvelope />
                    {pt.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt />
                    {pt.phonenumber}
                  </div>
                  <div>
                    <span className="text-gray-400">Experience:</span>{" "}
                    {pt.ptExperience || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleAssign(pt)}
                disabled={submittingId === pt._id}
                className="px-6 py-2 rounded-md bg-accent hover:bg-accent/90 font-semibold transition-all"
              >
                {submittingId === pt._id ? "Sending..." : "Send Request"}
              </button>
            </div>
          );
        })}

        {!loading && filteredPTs.length === 0 && (
          <p className="text-center text-gray-400">
            No trainer found
          </p>
        )}
      </div>

      {message && (
        <p className="mt-6 text-center text-green-400 font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
