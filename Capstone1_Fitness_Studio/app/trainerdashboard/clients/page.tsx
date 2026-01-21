"use client";

import { useState, useEffect } from "react";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle
} from "react-icons/fi";

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

interface Relationship {
  _id: string;
  ptId: string;
  userId: string;
  ptName: string;
  userName: string;
  status: "pending" | "active" | "rejected";
  createdAt?: string;
}

export default function ClientsPage() {
  const [pt, setPT] = useState<PT | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    const stored = localStorage.getItem("user");
    const ptUser = stored ? JSON.parse(stored) : null;
    if (!ptUser?._id) return;

    setLoading(true);
    try {
      // Fetch PT info and relationships in parallel
      const [ptRes, relRes] = await Promise.all([
        fetch(`http://localhost:5000/user/trainer/${ptUser._id}`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`http://localhost:5000/pt/relationships/${ptUser._id}`, {
          method: "GET",
          credentials: "include",
        })
      ]);

      const ptData: PT = await ptRes.json();
      setPT(ptData);

      const relData: Relationship[] = await relRes.json();
      setRelationships(relData);

      // Fetch client details
      const clientIds = ptData.ptClients?.map((c) => c.userId) || [];
      if (clientIds.length > 0) {
        const clientsRes = await fetch(
          `http://localhost:5000/pt/users?ids=${clientIds.join(",")}`,
          { method: "GET", credentials: "include" }
        );
        const clientsData: User[] = await clientsRes.json();
        setClients(clientsData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/pt/assign-pt/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/pt/assign-pt/${id}/reject`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  // Filter relationships
  const filteredRelationships = relationships.filter(rel => {
    const matchesSearch = rel.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || rel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: relationships.length,
    active: relationships.filter(r => r.status === "active").length,
    pending: relationships.filter(r => r.status === "pending").length,
    rejected: relationships.filter(r => r.status === "rejected").length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading clients...</p>
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
            <FiUsers className="text-accent" />
            My Clients
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your client relationships
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-5 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-3 rounded-xl">
              <FiUsers className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl p-5 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <FiCheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-2xl p-5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-3 rounded-xl">
              <FiClock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-2xl p-5 border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <FiXCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-primary-300 rounded-2xl p-4 mb-6 border border-primary-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-400 mb-4">
        Showing <span className="text-white font-medium">{filteredRelationships.length}</span> clients
      </p>

      {/* Clients Grid */}
      {filteredRelationships.length === 0 ? (
        <div className="bg-primary-300 rounded-2xl p-12 text-center border border-primary-100">
          <FiUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No clients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRelationships.map((rel) => {
            const clientDetail = clients.find(c => c._id === rel.userId);
            
            const statusConfig = {
              active: {
                color: "text-green-400",
                bgColor: "bg-green-500/20",
                borderColor: "border-green-500/30",
                icon: FiCheckCircle,
                label: "Active"
              },
              pending: {
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/20",
                borderColor: "border-yellow-500/30",
                icon: FiClock,
                label: "Pending"
              },
              rejected: {
                color: "text-red-400",
                bgColor: "bg-red-500/20",
                borderColor: "border-red-500/30",
                icon: FiXCircle,
                label: "Rejected"
              }
            };

            const config = statusConfig[rel.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={rel._id}
                className="bg-primary-300 rounded-2xl p-6 border border-primary-100 hover:border-primary-100/80 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <FiUser className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{rel.userName}</p>
                      <p className="text-xs text-gray-400">
                        {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 ${config.bgColor} ${config.borderColor} border rounded-full flex items-center gap-1.5`}>
                    <StatusIcon className={`w-3 h-3 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>

                {/* Client Details */}
                {clientDetail && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300 truncate">{clientDetail.email}</span>
                    </div>
                    {clientDetail.phonenumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiPhone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">{clientDetail.phonenumber}</span>
                      </div>
                    )}
                    {clientDetail.dob && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiCalendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300">
                          {new Date(clientDetail.dob).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {clientDetail.gender && (
                      <div className="flex items-center gap-2 text-sm">
                        <FiUser className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300 capitalize">{clientDetail.gender}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions for pending */}
                {rel.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t border-primary-100">
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
