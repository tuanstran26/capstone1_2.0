// 'use client'

// import { useState, useEffect } from 'react'
// import { 
//   FiSearch, 
//   FiFilter, 
//   FiTrash2, 
//   FiEye, 
// } from 'react-icons/fi'

// export default function UsersPage() {
//   const [users, setUsers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [totalUser, setTotalUser] = useState(0)

//   // Fetch user list from API
//   const fetchUsers = async () => {
//     try {
//       setLoading(true)
//       const res = await fetch('http://localhost:5000/admin/users', {  
//         method: 'GET',
//         credentials: 'include' 
//       })
//       const data = await res.json()

//       setTotalUser(data.length)

//       // 🔹 Fetch additional membership status for each user
//       const usersWithMembership = await Promise.all(
//         data.map(async (u: any) => {
//           if (u.membership) {
//             try {
//               const memRes = await fetch(`http://localhost:5000/admin/memberships/${u.membership}`, {
//                 credentials: 'include'
//               })
//               if (memRes.ok) {
//                 const memData = await memRes.json()
//                 return { ...u, membershipStatus: memData.status }
//               }
//             } catch (err) {
//               console.error(`Error fetching membership for user ${u._id}`, err)
//             }
//           }
//           return { ...u, membershipStatus: null }
//         })
//       )

//       setUsers(usersWithMembership)
//     } catch (err) {
//       console.error('Error fetching users:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Delete user
//   const deleteUser = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this user?')) return

//     try {
//       const res = await fetch(`http://localhost:5000/admin/users/${id}`, {
//         method: 'DELETE',
//         credentials: 'include'
//       })

//       if (res.ok) {
//         setUsers(users.filter(user => user._id !== id))
//       } else {
//         const errData = await res.json()
//         alert(`Delete failed: ${errData.message}`)
//       }
//     } catch (err) {
//       console.error('Error deleting user:', err)
//     }
//   }

//   useEffect(() => {
//     fetchUsers()
//   }, [])

//   // Filter users
//   const filteredUsers = users.filter((u) => {
//     const fullName = `${u.firstname} ${u.lastname}`.toLowerCase();
//     return (
//       fullName.includes(searchTerm.toLowerCase()) ||
//       u.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-white">User Management</h1>
//       </div>

//       {/* Filters */}
//       <div className="bg-primary-300 rounded-lg shadow-2xl p-4 flex flex-col md:flex-row gap-4 border border-primary-100">
//         <div className="relative flex-1">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <FiSearch className="text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-primary-100 rounded-md bg-primary-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20"
//           />
//         </div>

//         <select
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           className="px-3 py-2 border border-primary-100 rounded-md bg-primary-200 text-white focus:outline-none focus:ring-2 focus:ring-accent/20"
//         >
//           <option value="all">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//       </div>

//       {/* User Table */}
//       <div className="bg-primary-300 shadow-2xl overflow-hidden rounded-lg border border-primary-100">
//         <div className="overflow-x-auto">
//           {loading ? (
//             <div className="p-6 text-center text-gray-300">Loading data...</div>
//           ) : (
//             <table className="min-w-full divide-y divide-primary-100">
//               <thead className="bg-primary-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Membership</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-primary-300 divide-y divide-primary-100">
//                 {filteredUsers.length === 0 ? (
//                   <tr>
//                     <td colSpan={4} className="px-6 py-4 text-center text-gray-300">
//                       No users found
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredUsers.map((user) => (
//                     <tr key={user._id}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                         {user.firstname} {user.lastname}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                         {user.email}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {user.membershipStatus ? (
//                           <span
//                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               user.membershipStatus === 'active'
//                                 ? 'bg-green-900/30 text-green-300 border border-green-500/30'
//                                 : user.membershipStatus === 'pending'
//                                 ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
//                                 : 'bg-red-900/30 text-red-300 border border-red-500/30'
//                             }`}
//                           >
//                             {user.membershipStatus}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400 text-sm">Not available</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <div className="flex justify-end space-x-2">
//                           <button
//                             className="text-accent hover:text-accent/80 transition-colors"
//                             title="View Details"
//                           >
//                             <FiEye className="h-5 w-5" />
//                           </button>
//                           <button
//                             className="text-red-400 hover:text-red-300 transition-colors"
//                             title="Delete"
//                             onClick={() => deleteUser(user._id)}
//                           >
//                             <FiTrash2 className="h-5 w-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'

import { useEffect, useState } from 'react'
import { FiSearch, FiUser } from 'react-icons/fi'

interface IUser {
  _id: string
  firstname: string
  lastname: string
  email: string
  phonenumber: string
  dob?: string
  gender: 'male' | 'female' | 'other'
  role: 'user' | 'admin' | 'pt'
  address?: string | null
  ptSpecialization?: string | null
  ptExperience?: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/admin/users', {
        credentials: 'include',
      })
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Fetch users error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((u) =>
    `${u.firstname} ${u.lastname}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">All Users</h1>
      </div>

      {/* Search */}
      <div className="bg-primary-300 p-4 rounded-lg border border-primary-100 shadow">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name..."
            className="w-full pl-10 pr-4 py-2 bg-primary-200 border border-primary-100 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center text-gray-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-400">No users found</div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-primary-300 border border-primary-100 rounded-xl p-5 shadow hover:shadow-lg transition"
            >
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary-200 flex items-center justify-center text-accent text-3xl font-bold">
                  <FiUser />
                </div>

                {/* Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xl font-semibold text-white">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-400">
                      Phone: {user.phonenumber || 'N/A'}
                    </p>
                  </div>

                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      <span className="font-medium text-gray-400">Gender:</span>{' '}
                      {user.gender}
                    </p>
                    <p>
                      <span className="font-medium text-gray-400">Role:</span>{' '}
                      <span
                        className={`px-2 py-0.5 rounded text-xs ml-1 ${user.role === 'admin'
                            ? 'bg-red-900/40 text-red-300'
                            : user.role === 'pt'
                              ? 'bg-blue-900/40 text-blue-300'
                              : 'bg-green-900/40 text-green-300'
                          }`}
                      >
                        {user.role}
                      </span>
                    </p>

                    {user.role === 'pt' && (
                      <>
                        <p>
                          <span className="font-medium text-gray-400">
                            Specialization:
                          </span>{' '}
                          {user.ptSpecialization || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium text-gray-400">
                            Experience:
                          </span>{' '}
                          {user.ptExperience || 'N/A'}
                        </p>
                      </>
                    )}

                    {user.address && (
                      <p>
                        <span className="font-medium text-gray-400">
                          Address:
                        </span>{' '}
                        {user.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
