'use client'

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaWeight, FaRulerVertical, FaHeartbeat, FaDumbbell } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data cho biểu đồ
const progressData = [
  { date: '01/07/2023', weight: 75, bodyFat: 22, muscle: 35 },
  { date: '08/07/2023', weight: 74.5, bodyFat: 21.5, muscle: 35.2 },
  { date: '15/07/2023', weight: 74, bodyFat: 21, muscle: 35.5 },
  { date: '22/07/2023', weight: 73.2, bodyFat: 20.5, muscle: 36 },
  { date: '29/07/2023', weight: 72.8, bodyFat: 20, muscle: 36.3 },
  { date: '05/08/2023', weight: 72, bodyFat: 19.5, muscle: 36.8 },
];

// Mock data cho nhật ký tập luyện
const workoutLogs = [
  {
    id: 1,
    date: '05/08/2023',
    exercises: [
      { name: 'Squat', sets: 4, reps: 10, weight: 80 },
      { name: 'Deadlift', sets: 3, reps: 8, weight: 100 },
      { name: 'Bench Press', sets: 4, reps: 10, weight: 70 },
      { name: 'Pull-ups', sets: 3, reps: 12, weight: 0 },
    ],
    duration: 65,
    notes: 'Buổi tập tốt, tăng được trọng lượng squat',
  },
  {
    id: 2,
    date: '03/08/2023',
    exercises: [
      { name: 'Leg Press', sets: 4, reps: 12, weight: 120 },
      { name: 'Shoulder Press', sets: 3, reps: 10, weight: 45 },
      { name: 'Lat Pulldown', sets: 4, reps: 12, weight: 60 },
      { name: 'Bicep Curl', sets: 3, reps: 15, weight: 15 },
    ],
    duration: 55,
    notes: 'Tập trung vào kỹ thuật, giảm trọng lượng một chút',
  },
  {
    id: 3,
    date: '01/08/2023',
    exercises: [
      { name: 'Running', sets: 1, reps: 1, weight: 0 },
      { name: 'Plank', sets: 3, reps: 1, weight: 0 },
      { name: 'Push-ups', sets: 3, reps: 20, weight: 0 },
    ],
    duration: 45,
    notes: 'Cardio và bodyweight exercises',
  },
];

// Mock data cho mục tiêu
const goals = [
  {
    id: 1,
    title: 'Giảm cân',
    description: 'Giảm xuống 70kg',
    target: 70,
    current: 72,
    unit: 'kg',
    deadline: '01/10/2023',
    progress: 60,
  },
  {
    id: 2,
    title: 'Giảm mỡ',
    description: 'Giảm tỷ lệ mỡ cơ thể xuống 15%',
    target: 15,
    current: 19.5,
    unit: '%',
    deadline: '01/11/2023',
    progress: 35,
  },
  {
    id: 3,
    title: 'Tăng sức bền',
    description: 'Chạy 10km không nghỉ',
    target: 10,
    current: 7,
    unit: 'km',
    deadline: '15/10/2023',
    progress: 70,
  },
];

export default function Progress() {
  const [activeTab, setActiveTab] = useState('body');
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Xử lý thêm chỉ số cơ thể mới
  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý thêm dữ liệu vào progressData
    setShowAddMeasurement(false);
  };

  // Xử lý thêm nhật ký tập luyện mới
  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý thêm dữ liệu vào workoutLogs
    setShowAddWorkout(false);
  };

  // Xử lý thêm mục tiêu mới
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý thêm dữ liệu vào goals
    setShowAddGoal(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Progress Tracking</h1>

      {/* Tabs */}
      <div className="flex border-b border-primary-100 mb-6">
        <button
          onClick={() => setActiveTab('body')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'body'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Body Metrics
        </button>
        <button
          onClick={() => setActiveTab('workouts')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'workouts'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Workout Log
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'goals'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Goals
        </button>
      </div>

      {/* Body Measurements Tab */}
      {activeTab === 'body' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Body Metrics</h2>
            <button
              onClick={() => setShowAddMeasurement(true)}
              className="flex items-center bg-accent hover:bg-accent/90 text-white px-3 py-2 rounded-md transition-colors"
            >
              <FaPlus className="mr-2" />
              <span>Add New Metric</span>
            </button>
          </div>

          {/* Charts */}
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 mb-8 border border-primary-100">
            <h3 className="font-medium mb-4 text-white">Progress Chart</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
                  <Line type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat (%)" />
                  <Line type="monotone" dataKey="muscle" stroke="#ffc658" name="Muscle Mass (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent measurements */}
          <div className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100">
            <h3 className="font-medium mb-4 text-white">Recent Metrics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-100">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weight (kg)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Body Fat (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Muscle Mass (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {progressData.slice().reverse().map((entry, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-white">{entry.date}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-white">{entry.weight}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-white">{entry.bodyFat}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-white">{entry.muscle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add measurement modal */}
          {showAddMeasurement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Thêm chỉ số mới</h2>
                    <button 
                      onClick={() => setShowAddMeasurement(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleAddMeasurement}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ mỡ (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khối lượng cơ (kg)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddMeasurement(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-md"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Nhật ký tập luyện</h2>
            <button
              onClick={() => setShowAddWorkout(true)}
              className="flex items-center bg-accent hover:bg-accent/90 text-white px-3 py-2 rounded-md"
            >
              <FaPlus className="mr-2" />
              <span>Thêm buổi tập</span>
            </button>
          </div>

          {/* Workout logs */}
          <div className="space-y-6">
            {workoutLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{log.date}</h3>
                    <p className="text-gray-600 text-sm">Thời gian: {log.duration} phút</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài tập</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sets</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trọng lượng (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {log.exercises.map((exercise, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">{exercise.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{exercise.sets}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{exercise.reps}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{exercise.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {log.notes && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Ghi chú:</h4>
                    <p className="text-gray-600 text-sm">{log.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add workout modal */}
          {showAddWorkout && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Thêm buổi tập mới</h2>
                    <button 
                      onClick={() => setShowAddWorkout(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleAddWorkout}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bài tập</label>
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Bài tập</label>
                            <input 
                              type="text" 
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="Tên bài tập"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Sets</label>
                            <input 
                              type="number" 
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Reps</label>
                            <input 
                              type="number" 
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Trọng lượng (kg)</label>
                            <input 
                              type="number" 
                              step="0.5"
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="flex items-center text-accent hover:text-accent/80 text-sm"
                        >
                          <FaPlus className="mr-1" />
                          <span>Thêm bài tập</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        rows={3}
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddWorkout(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-md"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Mục tiêu</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center bg-accent hover:bg-accent/90 text-white px-3 py-2 rounded-md"
            >
              <FaPlus className="mr-2" />
              <span>Thêm mục tiêu</span>
            </button>
          </div>

          {/* Goals list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{goal.title}</h3>
                  <div className="flex space-x-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{goal.description}</p>
                
                <div className="flex justify-between mb-2">
                  <span>Tiến độ:</span>
                  <span>{goal.current} / {goal.target} {goal.unit}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-accent h-2.5 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500">Hạn chót: {goal.deadline}</p>
              </div>
            ))}
          </div>

          {/* Add goal modal */}
          {showAddGoal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Thêm mục tiêu mới</h2>
                    <button 
                      onClick={() => setShowAddGoal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleAddGoal}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                        rows={2}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                          placeholder="kg, %, km, v.v."
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hiện tại</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddGoal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-md"
                      >
                        Lưu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 