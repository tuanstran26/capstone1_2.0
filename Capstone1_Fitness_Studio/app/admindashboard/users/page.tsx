'use client'

import { useState, useEffect } from 'react'
import { 
  FiSearch, 
  FiFilter, 
  FiTrash2, 
  FiEye, 
} from 'react-icons/fi'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [totalUser, setTotalUser] = useState(0)

  // Fetch user list from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/admin/users', {  
        method: 'GET',
        credentials: 'include' 
      })
      const data = await res.json()

      setTotalUser(data.length)

      // 🔹 Fetch additional membership status for each user
      const usersWithMembership = await Promise.all(
        data.map(async (u: any) => {
          if (u.membership) {
            try {
              const memRes = await fetch(`http://localhost:5000/admin/memberships/${u.membership}`, {
                credentials: 'include'
              })
              if (memRes.ok) {
                const memData = await memRes.json()
                return { ...u, membershipStatus: memData.status }
              }
            } catch (err) {
              console.error(`Error fetching membership for user ${u._id}`, err)
            }
          }
          return { ...u, membershipStatus: null }
        })
      )

      setUsers(usersWithMembership)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`http://localhost:5000/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        setUsers(users.filter(user => user._id !== id))
      } else {
        const errData = await res.json()
        alert(`Delete failed: ${errData.message}`)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-primary-300 rounded-lg shadow-2xl p-4 flex flex-col md:flex-row gap-4 border border-primary-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-primary-100 rounded-md bg-primary-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-primary-100 rounded-md bg-primary-200 text-white focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-primary-300 shadow-2xl overflow-hidden rounded-lg border border-primary-100">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-300">Loading data...</div>
          ) : (
            <table className="min-w-full divide-y divide-primary-100">
              <thead className="bg-primary-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Membership</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-primary-300 divide-y divide-primary-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-300">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {user.firstname} {user.lastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.membershipStatus ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.membershipStatus === 'active'
                                ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                                : user.membershipStatus === 'pending'
                                ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                                : 'bg-red-900/30 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {user.membershipStatus}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-accent hover:text-accent/80 transition-colors"
                            title="View Details"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                            onClick={() => deleteUser(user._id)}
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
