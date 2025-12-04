"use client";


import { useState, useEffect } from "react";



export default function UpdateTrainerForm() {
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

  const [trainerId, setTrainerId] = useState(null);
  const [ptExperience, setExperience] = useState("Senior");
  const [ptSpecialization, setSpecialization] = useState("Calisthenic");
  const [loading, setLoading] = useState(false);
  const [relationshipList, setRelationshipList] = useState<Relationship[]>([]);
  const [message, setMessage] = useState("");

  const fetchRelationships = async () => {
    try {
      setLoading(true);

      const stored = localStorage.getItem("user");
      const ptUser = stored ? JSON.parse(stored) : null;

      if (!ptUser || !ptUser._id) {
        console.error("PT ID not found in localStorage");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `http://localhost:5000/pt/relationships/${ptUser._id}`,
        { method: "GET", credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch relationships");

      const data = await res.json();

      setRelationshipList(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching relationships:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, []);


  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/pt/assign-pt/${id}/approve`,
        { method: "PATCH", credentials: "include" }
      );
      if (!res.ok) throw new Error("Approve failed");
      setMessage("Approved successfully!");
      fetchRelationships(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage("Error approving assignment");
    }
  };

  // Reject
  const handleReject = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/pt/assign-pt/${id}/reject`,
        { method: "PATCH", credentials: "include" }
      );
      if (!res.ok) throw new Error("Reject failed");
      setMessage("Rejected successfully!");
      fetchRelationships(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage("Error rejecting assignment");
    }
  };

  // 🔹 Retrieve trainerId from localStorage when component loads
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

  const updateTrainer = async () => {
    if (!trainerId) {
      alert("Trainer ID not found!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5000/pt/update-profile/${trainerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ptExperience,
          ptSpecialization,
        }),
      });

      const data = await res.json();
      console.log("Update response:", data);

      alert("Updated trainer successfully!");

    } catch (err) {
      console.error(err);
      alert("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary-300 rounded-lg shadow-2xl p-6 mb-8 border border-primary-100">
      <h2 className="text-xl font-bold text-white mb-4">Update Trainer Details</h2>

      {!trainerId && (
        <p className="text-red-400 mb-4">⚠ Cannot update — user not found in localStorage.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Experience */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Experience</label>
          <select
            value={ptExperience}
            onChange={(e) => setExperience(e.target.value)}
            className="bg-primary-200 p-2 rounded-md border border-primary-100 text-white w-full"
          >
            <option value="Senior">Senior</option>
            <option value="Professional">Professional</option>
            <option value="Veteran">Veteran</option>
          </select>
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">Specialization</label>
          <select
            value={ptSpecialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="bg-primary-200 p-2 rounded-md border border-primary-100 text-white w-full"
          >
            <option value="Calisthenic">Calisthenic</option>
            <option value="Yoga">Yoga</option>
            <option value="Athlete">Athlete</option>
            <option value="GYM">GYM</option>
            <option value="Sport">Sport</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={updateTrainer}
          disabled={loading || !trainerId}
          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-full font-medium"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Your Clients</h2>
      {message && <p className="mb-4 text-white-400">{message}</p>}
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <div className="space-y-4">
          {relationshipList.map((rel) => (
            <div
              key={rel._id}
              className="p-4 border rounded-md bg-primary-200 flex justify-between items-center"
            >
              <div>
                <p className="text-white">
                  <strong>Client name:</strong> {rel.userName}
                </p>
                <p className="text-white">
                  <strong>Request status:</strong> {rel.status}
                </p>
              </div>
              {rel.status === "pending" && (
                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(rel._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(rel._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
