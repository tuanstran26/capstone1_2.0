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
import { 
  FiSearch, 
  FiUser, 
  FiUsers, 
  FiTrash2, 
  FiEye, 
  FiX, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiCalendar,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiUserX,
  FiShield
} from 'react-icons/fi'

interface IMembership {
  _id: string
  type: string
  status: string
  startDate: string
  endDate: string
  price: number
}

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
  membership?: string | null
  membershipData?: IMembership | null
  createdAt?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [membershipFilter, setMembershipFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 8

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/admin/users', {
        credentials: 'include',
      })
      const data = await res.json()
      
      // Fetch membership data for each user
      const usersWithMembership = await Promise.all(
        data.map(async (u: IUser) => {
          if (u.membership) {
            try {
              const memRes = await fetch(`http://localhost:5000/admin/memberships/${u.membership}`, {
                credentials: 'include'
              })
              if (memRes.ok) {
                const memData = await memRes.json()
                return { ...u, membershipData: memData }
              }
            } catch (err) {
              console.error(`Error fetching membership for user ${u._id}`, err)
            }
          }
          return { ...u, membershipData: null }
        })
      )
      
      setUsers(usersWithMembership)
    } catch (err) {
      console.error('Fetch users error:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const res = await fetch(`http://localhost:5000/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        setUsers(users.filter(user => user._id !== id))
        setShowModal(false)
        setSelectedUser(null)
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
    const matchesSearch = `${u.firstname} ${u.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesMembership = membershipFilter === 'all' || 
      (membershipFilter === 'active' && u.membershipData?.status === 'active') ||
      (membershipFilter === 'expired' && u.membershipData?.status === 'expired') ||
      (membershipFilter === 'none' && !u.membershipData)
    
    return matchesSearch && matchesRole && matchesMembership
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  // Stats
  const totalUsers = users.length
  const activeMembers = users.filter(u => u.membershipData?.status === 'active').length
  const expiredMembers = users.filter(u => u.membershipData?.status === 'expired').length
  const noMembership = users.filter(u => !u.membershipData).length

  const openUserModal = (user: IUser) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const getMembershipStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-red-600'
      case 'pt':
        return 'from-blue-500 to-blue-600'
      default:
        return 'from-green-500 to-emerald-600'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pt':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage and monitor all registered users</p>
        </div>
        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-semibold">{totalUsers}</span> users
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">{totalUsers}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <FiUsers className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Members</p>
              <p className="text-2xl font-bold text-white mt-1">{activeMembers}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-xl">
              <FiUserCheck className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Expired Members</p>
              <p className="text-2xl font-bold text-white mt-1">{expiredMembers}</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-xl">
              <FiUserX className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-4 border border-gray-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">No Membership</p>
              <p className="text-2xl font-bold text-white mt-1">{noMembership}</p>
            </div>
            <div className="bg-gray-500/20 p-3 rounded-xl">
              <FiUser className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-primary-300 p-4 rounded-xl border border-primary-100 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-primary-200 border border-primary-100 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
          
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
              className="px-4 py-2.5 bg-primary-200 border border-primary-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="pt">Trainers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          
          {/* Membership Filter */}
          <select
            value={membershipFilter}
            onChange={(e) => { setMembershipFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2.5 bg-primary-200 border border-primary-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          >
            <option value="all">All Memberships</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="none">No Membership</option>
          </select>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-primary-300 rounded-xl border border-primary-100">
          <FiUsers className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-4 text-gray-400">No users found matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedUsers.map((user) => (
              <div
                key={user._id}
                className="bg-primary-300 border border-primary-100 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-primary-100/50 transition-all duration-300 group"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {user.firstname} {user.lastname}
                        </h3>
                        <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                          <FiMail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openUserModal(user)}
                          className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg text-accent transition-colors"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        <FiShield className="w-3 h-3 mr-1" />
                        {user.role.toUpperCase()}
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getMembershipStatusColor(user.membershipData?.status)}`}>
                        {user.membershipData?.status ? user.membershipData.status.toUpperCase() : 'NO MEMBERSHIP'}
                      </span>
                      
                      {user.membershipData?.type && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {user.membershipData.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-primary-300 rounded-xl p-4 border border-primary-100">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-medium">{startIndex + 1}</span> to{' '}
                <span className="text-white font-medium">{Math.min(startIndex + usersPerPage, filteredUsers.length)}</span> of{' '}
                <span className="text-white font-medium">{filteredUsers.length}</span> users
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-primary-200 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                ).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-accent text-white'
                        : 'bg-primary-200 hover:bg-primary-100 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-primary-200 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary-300 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary-100 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary-300 border-b border-primary-100 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-primary-200 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getRoleColor(selectedUser.role)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {selectedUser.firstname?.charAt(0)}{selectedUser.lastname?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedUser.firstname} {selectedUser.lastname}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getMembershipStatusColor(selectedUser.membershipData?.status)}`}>
                      {selectedUser.membershipData?.status?.toUpperCase() || 'NO MEMBERSHIP'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <FiMail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-white font-medium">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <FiPhone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-white font-medium">{selectedUser.phonenumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <FiUser className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Gender</p>
                      <p className="text-white font-medium capitalize">{selectedUser.gender}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/20 p-2 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date of Birth</p>
                      <p className="text-white font-medium">
                        {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedUser.address && (
                <div className="bg-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/20 p-2 rounded-lg">
                      <FiMapPin className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Address</p>
                      <p className="text-white font-medium">{selectedUser.address}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Membership Info */}
              {selectedUser.membershipData && (
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-5 border border-accent/20">
                  <h4 className="text-lg font-semibold text-white mb-4">Membership Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Plan Type</p>
                      <p className="text-white font-medium">{selectedUser.membershipData.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getMembershipStatusColor(selectedUser.membershipData.status)}`}>
                        {selectedUser.membershipData.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="text-white font-medium">
                        {new Date(selectedUser.membershipData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">End Date</p>
                      <p className="text-white font-medium">
                        {new Date(selectedUser.membershipData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* PT Info */}
              {selectedUser.role === 'pt' && (
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-white mb-4">Trainer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Specialization</p>
                      <p className="text-white font-medium">{selectedUser.ptSpecialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Experience</p>
                      <p className="text-white font-medium">{selectedUser.ptExperience || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-primary-300 border-t border-primary-100 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primary-200 hover:bg-primary-100 rounded-lg text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => deleteUser(selectedUser._id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
