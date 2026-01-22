'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  FiCamera, 
  FiUpload, 
  FiTrash2, 
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiAward,
  FiSave,
  FiEdit3,
  FiX,
  FiCheck
} from 'react-icons/fi'

interface TrainerProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: string;
  ptSpecialization: string;
  ptExperience: string;
  ptAvatar?: string;
  ptClients?: Array<{ userId: string; name: string }>;
}

export default function TrainerProfilePage() {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    ptSpecialization: '',
    ptExperience: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTrainerProfile()
  }, [])

  const fetchTrainerProfile = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        setLoading(false)
        return
      }

      const parsed = JSON.parse(userData)
      const trainerId = parsed._id

      const res = await fetch(`http://localhost:5000/user/trainer/${trainerId}`, {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setTrainer(data)
        setEditData({
          ptSpecialization: data.ptSpecialization || '',
          ptExperience: data.ptExperience || ''
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !trainer) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only image files are allowed (jpeg, jpg, png, gif, webp)' })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch(`http://localhost:5000/pt/upload-avatar/${trainer._id}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setTrainer(prev => prev ? { ...prev, ptAvatar: data.avatarUrl } : null)
        setMessage({ type: 'success', text: 'Avatar uploaded successfully!' })
        
        // Update localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsed = JSON.parse(userData)
          parsed.ptAvatar = data.avatarUrl
          localStorage.setItem('user', JSON.stringify(parsed))
        }
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.message || 'Failed to upload avatar' })
      }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setMessage({ type: 'error', text: 'Error uploading avatar' })
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAvatar = async () => {
    if (!trainer || !trainer.ptAvatar) return

    if (!confirm('Are you sure you want to delete your avatar?')) return

    try {
      const res = await fetch(`http://localhost:5000/pt/delete-avatar/${trainer._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        setTrainer(prev => prev ? { ...prev, ptAvatar: undefined } : null)
        setMessage({ type: 'success', text: 'Avatar deleted successfully!' })
        
        // Update localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsed = JSON.parse(userData)
          delete parsed.ptAvatar
          localStorage.setItem('user', JSON.stringify(parsed))
        }
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.message || 'Failed to delete avatar' })
      }
    } catch (err) {
      console.error('Error deleting avatar:', err)
      setMessage({ type: 'error', text: 'Error deleting avatar' })
    }
  }

  const handleSaveProfile = async () => {
    if (!trainer) return

    try {
      const res = await fetch(`http://localhost:5000/pt/update-profile/${trainer._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      if (res.ok) {
        const data = await res.json()
        setTrainer(prev => prev ? { 
          ...prev, 
          ptSpecialization: editData.ptSpecialization,
          ptExperience: editData.ptExperience 
        } : null)
        setIsEditing(false)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setMessage({ type: 'error', text: 'Error updating profile' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="text-center py-12">
        <FiUser className="text-5xl text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/30 to-primary-200 rounded-xl p-6 border border-accent/20">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400">Manage your trainer profile and avatar</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-900/30 border border-green-500/30 text-green-400' 
            : 'bg-red-900/30 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <FiCheck /> : <FiX />}
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <FiCamera className="text-accent" />
          Profile Photo
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar Preview */}
          <div className="relative">
            <div 
              className="w-40 h-40 rounded-full overflow-hidden bg-primary-200 border-4 border-accent/30 cursor-pointer hover:border-accent/60 transition-all group"
              onClick={handleAvatarClick}
            >
              {trainer.ptAvatar ? (
                <Image
                  src={`http://localhost:5000${trainer.ptAvatar}`}
                  alt="Trainer Avatar"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-purple-500">
                  <span className="text-5xl text-white font-bold">
                    {trainer.firstname?.charAt(0) || 'T'}
                  </span>
                </div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FiCamera className="text-white text-3xl" />
              </div>
            </div>

            {/* Upload indicator */}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Upload your photo</h3>
              <p className="text-gray-400 text-sm mb-4">
                A professional photo helps members trust you. Max size: 5MB. 
                Supported formats: JPEG, PNG, GIF, WebP.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <FiUpload />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>

              {trainer.ptAvatar && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiTrash2 />
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiUser className="text-accent" />
            Profile Information
          </h2>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-200 hover:bg-primary-100 text-white rounded-lg transition-colors"
            >
              <FiEdit3 />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditData({
                    ptSpecialization: trainer.ptSpecialization || '',
                    ptExperience: trainer.ptExperience || ''
                  })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <FiX />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
              >
                <FiSave />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <FiUser className="text-accent" />
              Full Name
            </label>
            <p className="text-white text-lg bg-primary-200 rounded-lg p-3">
              {trainer.firstname} {trainer.lastname}
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <FiMail className="text-accent" />
              Email
            </label>
            <p className="text-white text-lg bg-primary-200 rounded-lg p-3">
              {trainer.email}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <FiPhone className="text-accent" />
              Phone Number
            </label>
            <p className="text-white text-lg bg-primary-200 rounded-lg p-3">
              {trainer.phonenumber || 'Not provided'}
            </p>
          </div>

          {/* Clients Count */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <FiAward className="text-accent" />
              Total Clients
            </label>
            <p className="text-white text-lg bg-primary-200 rounded-lg p-3">
              {trainer.ptClients?.length || 0} clients
            </p>
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <FiBriefcase className="text-accent" />
              Specialization
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.ptSpecialization}
                onChange={(e) => setEditData(prev => ({ ...prev, ptSpecialization: e.target.value }))}
                placeholder="e.g., Weight Loss, Muscle Building, Yoga"
                className="w-full bg-primary-200 border border-primary-100 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            ) : (
              <p className="text-white text-lg bg-primary-200 rounded-lg p-3">
                {trainer.ptSpecialization || 'Not specified'}
              </p>
            )}
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <FiAward className="text-accent" />
              Experience
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.ptExperience}
                onChange={(e) => setEditData(prev => ({ ...prev, ptExperience: e.target.value }))}
                placeholder="e.g., 5 years, Senior, Expert"
                className="w-full bg-primary-200 border border-primary-100 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            ) : (
              <p className="text-white text-lg bg-primary-200 rounded-lg p-3">
                {trainer.ptExperience || 'Not specified'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-blue-400 font-semibold mb-3">💡 Tips for a great profile</h3>
        <ul className="text-gray-400 text-sm space-y-2">
          <li>• Use a professional, high-quality photo</li>
          <li>• Keep your specialization updated to attract the right clients</li>
          <li>• Mention your certifications in your experience</li>
          <li>• A complete profile gets more booking requests!</li>
        </ul>
      </div>
    </div>
  )
}
