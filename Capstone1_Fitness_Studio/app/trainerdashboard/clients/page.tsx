"use client";

import { useState, useEffect } from "react";

interface PTClient {
  _id: string;
  userId: string;
  name: string;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dob: string;
  gender: string;
}

interface PT {
  _id: string;
  firstname: string;
  lastname: string;
  ptClients: PTClient[];
}

export default function PTClientsList() {
  const [pt, setPT] = useState<PT | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const ptId = JSON.parse(localStorage.getItem("user") || "{}")._id;

  const fetchPTAndClients = async () => {
    if (!ptId) return;
    try {
      setLoading(true);

      // 1️⃣ Lấy PT info
      const ptRes = await fetch(`http://localhost:5000/user/trainer/${ptId}`, {
        method: "GET",
        credentials: "include",
      });
      const ptData: PT = await ptRes.json();
      setPT(ptData);

      // 2️⃣ Lấy danh sách clientId từ ptClients
      const clientIds = ptData.ptClients.map((c) => c.userId);

      if (clientIds.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // 3️⃣ Fetch thông tin từng user (hoặc backend có thể support batch API)
      const clientsRes = await fetch(
        `http://localhost:5000/pt/users?ids=${clientIds.join(",")}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const clientsData: User[] = await clientsRes.json();
      setClients(clientsData);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTAndClients();
  }, []);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        {pt ? `${pt.firstname} ${pt.lastname}'s Clients` : "Your Clients"}
      </h2>

      {clients.length === 0 ? (
        <p className="text-white">No clients yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div
              key={c._id}
              className="p-4 border rounded-md bg-primary-200"
            >
              <p className="mb-2 font-semibold text-white">
                <strong>Name:</strong> {c.firstname} {c.lastname}
              </p>
              <p className="text-white">
                <strong>Email:</strong> {c.email}
              </p>
              <p className="text-white">
                <strong>Phone:</strong> {c.phonenumber}
              </p>
              <p className="text-white">
                <strong>DOB:</strong> {new Date(c.dob).toLocaleDateString()}
              </p>
              <p className="text-white">
                <strong>Gender:</strong> {c.gender}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
