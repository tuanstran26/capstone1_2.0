'use client'

import { useState } from 'react';
// Clerk removed
import { FaWeight, FaRulerVertical, FaHeartbeat, FaRunning } from 'react-icons/fa';

export default function StandardProgress() {
  const [activeTab, setActiveTab] = useState('weight');

  // Dữ liệu mẫu - trong thực tế sẽ lấy từ database
  const weightData = [
    { date: '01/06/2025', value: 75 },
    { date: '08/06/2025', value: 74.5 },
    { date: '15/06/2025', value: 74 },
    { date: '22/06/2025', value: 73.2 },
  ];

  const workoutData = [
    { date: '01/06/2025', type: 'Cardio', duration: 30, calories: 250 },
    { date: '03/06/2025', type: 'Sức mạnh', duration: 45, calories: 320 },
    { date: '05/06/2025', type: 'Yoga', duration: 60, calories: 200 },
    { date: '08/06/2025', type: 'Cardio', duration: 40, calories: 300 },
    { date: '10/06/2025', type: 'Sức mạnh', duration: 50, calories: 350 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Theo dõi tiến độ</h1>
        <p className="text-gray-600">
          Theo dõi hành trình tập luyện của bạn và xem sự tiến bộ theo thời gian.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'weight' ? 'text-accent border-b-2 border-accent' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('weight')}
          >
            <FaWeight className="mr-2" /> Cân nặng
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'workouts' ? 'text-accent border-b-2 border-accent' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('workouts')}
          >
            <FaRunning className="mr-2" /> Buổi tập
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'weight' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Lịch sử cân nặng (kg)</h2>
                <button className="text-sm text-accent font-medium">+ Thêm mới</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-sm border-b">
                      <th className="pb-3 font-medium">Ngày</th>
                      <th className="pb-3 font-medium">Cân nặng (kg)</th>
                      <th className="pb-3 font-medium">Thay đổi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightData.map((item, index) => {
                      const prevValue = index > 0 ? weightData[index - 1].value : item.value;
                      const change = item.value - prevValue;
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3">{item.date}</td>
                          <td className="py-3">{item.value}</td>
                          <td className="py-3">
                            {index > 0 && (
                              <span className={change <= 0 ? 'text-green-500' : 'text-red-500'}>
                                {change <= 0 ? '▼' : '▲'} {Math.abs(change).toFixed(1)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'workouts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Buổi tập gần đây</h2>
                <button className="text-sm text-accent font-medium">+ Thêm buổi tập</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-sm border-b">
                      <th className="pb-3 font-medium">Ngày</th>
                      <th className="pb-3 font-medium">Loại tập luyện</th>
                      <th className="pb-3 font-medium">Thời gian (phút)</th>
                      <th className="pb-3 font-medium">Calories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutData.map((workout, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{workout.date}</td>
                        <td className="py-3">{workout.type}</td>
                        <td className="py-3">{workout.duration}</td>
                        <td className="py-3">{workout.calories}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mẹo cải thiện</h2>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>Đặt mục tiêu rõ ràng và có thể đạt được</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>Theo dõi tiến độ của bạn thường xuyên</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>Kết hợp các bài tập sức mạnh và cardio</span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>Nghỉ ngơi đầy đủ giữa các buổi tập</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 