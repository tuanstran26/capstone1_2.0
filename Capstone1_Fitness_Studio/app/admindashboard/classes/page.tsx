'use client'

import { useState, useEffect } from 'react'
import { 
  FiUsers,
  FiCalendar,
  FiSearch,
  FiMail,
  FiPhone,
  FiAward,
  FiBriefcase,
  FiStar,
  FiUserCheck
} from 'react-icons/fi'
import { MdFitnessCenter } from 'react-icons/md'

interface Trainer {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  phonenumber?: string;
  ptSpecialization?: string;
  ptExperience?: string;
  ptClients?: Array<{ userId: string; name: string; _id: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Schedule {
  _id: string;
  scheduleName: string;
  scheduleDate: string;
  shift: string;
  ptId: string;
  ptName: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export default function ClassesPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [trainerSchedule, setTrainerSchedule] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'trainers' | 'schedule'>('trainers')
  
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5000/admin/pts', { credentials: 'include' })
        
        if (res.ok) {
          const data = await res.json()
          setTrainers(data || [])
        }
      } catch (err) {
        console.error('Error fetching trainers:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrainers()
  }, [])
  
  // Fetch schedule when trainer is selected
  const fetchTrainerSchedule = async (trainerId: string) => {
    try {
      setScheduleLoading(true)
      const res = await fetch(`http://localhost:5000/schedule/trainer/${trainerId}`, { credentials: 'include' })
      
      if (res.ok) {
        const data = await res.json()
        setTrainerSchedule(data || [])
      } else {
        setTrainerSchedule([])
      }
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setTrainerSchedule([])
    } finally {
      setScheduleLoading(false)
    }
  }
  
  const handleSelectTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    fetchTrainerSchedule(trainer._id)
    setActiveTab('schedule')
  }
  
  // Filter trainers
  const filteredTrainers = trainers.filter(trainer => {
    const fullName = `${trainer.firstname} ${trainer.lastname}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) ||
           trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (trainer.ptSpecialization?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  })
  
  // Stats
  const totalTrainers = trainers.length
  const totalClients = trainers.reduce((sum, t) => {
    const clientCount = Array.isArray(t.ptClients) ? t.ptClients.length : 0
    return sum + clientCount
  }, 0)
  const avgClientsPerTrainer = totalTrainers > 0 && !isNaN(totalClients) 
    ? Math.round(totalClients / totalTrainers) 
    : 0
  
  // Specializations count
  const specializations = trainers.reduce((acc, t) => {
    const spec = t.ptSpecialization || 'General'
    acc[spec] = (acc[spec] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-primary-200 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30">
            <MdFitnessCenter className="text-3xl text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Trainers & Schedule</h1>
            <p className="text-gray-400">Manage personal trainers and their schedules</p>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
            <FiUsers className="text-blue-400 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalTrainers}</p>
            <p className="text-sm text-gray-400">Total Trainers</p>
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
            <FiUserCheck className="text-green-400 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalClients}</p>
            <p className="text-sm text-gray-400">Total Clients</p>
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
            <FiStar className="text-purple-400 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{avgClientsPerTrainer}</p>
            <p className="text-sm text-gray-400">Avg Clients/Trainer</p>
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-xl p-4 border border-primary-100 flex items-center gap-4">
          <div className="bg-accent/20 p-3 rounded-lg border border-accent/30">
            <FiAward className="text-accent text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{Object.keys(specializations).length}</p>
            <p className="text-sm text-gray-400">Specializations</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-primary-300 rounded-xl border border-primary-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-primary-100">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('trainers')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'trainers'
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Trainer List
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiCalendar className="inline mr-2" />
              Schedule View
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Trainers Tab */}
          {activeTab === 'trainers' && (
            <div>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search trainers by name, email or specialization..."
                    className="pl-10 pr-4 py-3 bg-primary-200 border border-primary-100 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Trainers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrainers.map((trainer) => (
                  <div 
                    key={trainer._id} 
                    className="bg-primary-200 rounded-xl p-5 border border-primary-100 hover:border-accent/50 transition-all cursor-pointer"
                    onClick={() => handleSelectTrainer(trainer)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {trainer.firstname?.charAt(0) || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {trainer.firstname} {trainer.lastname}
                        </h3>
                        <p className="text-accent text-sm">{trainer.ptSpecialization || 'General Fitness'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiMail className="flex-shrink-0" />
                        <span className="truncate">{trainer.email}</span>
                      </div>
                      {trainer.phonenumber && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <FiPhone className="flex-shrink-0" />
                          <span>{trainer.phonenumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiBriefcase className="flex-shrink-0" />
                        <span>{trainer.ptExperience || 'Experience not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-primary-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FiUserCheck className="text-green-400" />
                        <span className="text-white font-medium">{trainer.ptClients?.length || 0} clients</span>
                      </div>
                      <button className="text-accent text-sm hover:underline">
                        View Schedule →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredTrainers.length === 0 && (
                <div className="text-center py-12">
                  <FiUsers className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No trainers found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          )}
          
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              {selectedTrainer ? (
                <div>
                  {/* Selected Trainer Info */}
                  <div className="bg-primary-200 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedTrainer.firstname?.charAt(0) || 'T'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        {selectedTrainer.firstname} {selectedTrainer.lastname}
                      </h3>
                      <p className="text-gray-400 text-sm">{selectedTrainer.ptSpecialization || 'General Fitness'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedTrainer(null)
                        setTrainerSchedule([])
                        setActiveTab('trainers')
                      }}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Change Trainer
                    </button>
                  </div>
                  
                  {/* Schedule List */}
                  {scheduleLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
                    </div>
                  ) : trainerSchedule.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium mb-4">Scheduled Sessions ({trainerSchedule.length})</h4>
                      {trainerSchedule.map((schedule) => (
                        <div 
                          key={schedule._id} 
                          className="bg-primary-200 rounded-lg p-4 flex items-center gap-4"
                        >
                          <div className="bg-accent/20 p-3 rounded-lg border border-accent/30">
                            <FiCalendar className="text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{schedule.userName}</p>
                            <p className="text-gray-400 text-sm">
                              {schedule.scheduleDate} - {schedule.shift}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">{schedule.scheduleName}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                            Scheduled
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-primary-200 rounded-xl">
                      <FiCalendar className="text-5xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No scheduled sessions</p>
                      <p className="text-gray-500 text-sm">This trainer has no upcoming sessions</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUsers className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select a trainer to view schedule</p>
                  <button 
                    onClick={() => setActiveTab('trainers')}
                    className="mt-4 text-accent hover:underline"
                  >
                    Go to Trainer List
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Specializations Overview */}
      <div className="bg-primary-300 rounded-xl p-6 border border-primary-100">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiAward className="text-accent" />
          Trainers by Specialization
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(specializations).map(([spec, count]) => (
            <div key={spec} className="bg-primary-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-gray-400 text-sm mt-1">{spec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
