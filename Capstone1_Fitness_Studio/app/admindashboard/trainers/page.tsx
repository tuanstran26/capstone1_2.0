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

//   // Fetch trainer list from API
//   const fetchUsers = async () => {
//     try {
//       setLoading(true)
//       const res = await fetch('http://localhost:5000/admin/pts', {
//         method: 'GET',
//         credentials: 'include'
//       })
//       const data = await res.json()

//       // 🔹 Fetch additional membership status for each trainer
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

//   // Delete trainer
//   const deleteUser = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this trainer?')) return

//     try {
//       const res = await fetch(`http://localhost:5000/admin/pts/${id}`, {
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

//   // Filter trainers
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
//         <h1 className="text-3xl font-bold text-white">Trainer Management</h1>
//       </div>

//       {/* Filters */}
//       <div className="bg-primary-300 rounded-lg shadow-2xl p-4 flex flex-col md:flex-row gap-4 border border-primary-100">
//         <div className="relative flex-1">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <FiSearch className="text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search by name or email..."
//             className="block w-full pl-10 pr-3 py-2 border border-primary-100 rounded-md bg-primary-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="flex items-center space-x-2">
//           <FiFilter className="text-gray-400" />
//           <select
//             className="px-3 py-2 border border-primary-100 rounded-md bg-primary-200 text-white focus:outline-none focus:ring-2 focus:ring-accent/20"
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//             <option value="pending">Pending</option>
//           </select>
//         </div>
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
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Specialization</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Experience</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Clients</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-primary-300 divide-y divide-primary-100">
//                 {filteredUsers.length === 0 ? (
//                   <tr>
//                     <td colSpan={4} className="px-6 py-4 text-center text-gray-300">
//                       No trainers found
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
//                         {user.ptSpecialization ? (
//                           <span className="px-2 py-1 text-sm font-medium text-white rounded bg-primary-600/50">
//                             {user.ptSpecialization}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400 text-sm">Not available</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {user.ptExperience ? (
//                           <span className="px-2 py-1 text-sm font-medium text-white rounded bg-primary-600/50">
//                             {user.ptExperience}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400 text-sm">Not available</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {user.ptClients && user.ptClients.length > 0 ? (
//                           <ul className="text-sm text-white space-y-1">
//                             {user.ptClients.map((client: { userId: string; name: string }, idx: number) => (
//                               <li key={client.userId}>{client.name}</li>
//                             ))}
//                           </ul>
//                         ) : (
//                           <span className="text-gray-400 text-sm">No clients</span>
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

interface Client {
  userId: string
  name: string
}

interface Trainer {
  _id: string
  firstname: string
  lastname: string
  email: string
  ptSpecialization?: string | null
  ptExperience?: string | null
  ptClients?: Client[]
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/admin/pts', {
        credentials: 'include',
      })
      const data = await res.json()
      setTrainers(data)
    } catch (err) {
      console.error('Fetch trainers error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter((pt) =>
    `${pt.firstname} ${pt.lastname} ${pt.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          Trainer Management
        </h1>
        <span className="text-gray-400">
          Total: {filteredTrainers.length}
        </span>
      </div>

      {/* Search */}
      <div className="bg-primary-300 p-4 rounded-lg border border-primary-100 shadow">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainer by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-primary-200 border border-primary-100 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Trainer List */}
      {loading ? (
        <div className="text-center text-gray-400">
          Loading trainers...
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="text-center text-gray-400">
          No trainers found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrainers.map((pt) => (
            <div
              key={pt._id}
              className="bg-primary-300 border border-primary-100 rounded-xl p-5 shadow hover:shadow-lg transition"
            >
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-primary-200 flex items-center justify-center text-accent text-4xl flex-shrink-0">
                  <FiUser />
                </div>

                {/* Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic info */}
                  <div>
                    <p className="text-2xl font-semibold text-white">
                      {pt.firstname} {pt.lastname}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {pt.email}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-gray-300">
                      <p>
                        <span className="text-gray-400 font-medium">
                          Specialization:
                        </span>{' '}
                        {pt.ptSpecialization || 'N/A'}
                      </p>
                      <p>
                        <span className="text-gray-400 font-medium">
                          Experience:
                        </span>{' '}
                        {pt.ptExperience || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Clients list */}
                  <div className="flex flex-col justify-start">
                    <p className="text-gray-400 font-medium mb-2">
                      Clients ({pt.ptClients?.length || 0})
                    </p>

                    {pt.ptClients && pt.ptClients.length > 0 ? (
                      <ul className="space-y-1 text-sm text-white max-h-32 overflow-y-auto">
                        {pt.ptClients.map((client) => (
                          <li
                            key={client.userId}
                            className="px-3 py-1 rounded bg-primary-600/40"
                          >
                            {client.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No clients
                      </span>
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

