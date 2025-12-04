'use client'

import { useState } from 'react';
// Clerk removed
import { FaWeight, FaRulerVertical, FaHeartbeat, FaRunning, FaUtensils, FaChartLine, FaChartBar } from 'react-icons/fa';

export default function PremiumProgress() {
  const [activeTab, setActiveTab] = useState('weight');

  // Dữ liệu mẫu - trong thực tế sẽ lấy từ database
  const weightData = [
    { date: '01/06/2025', value: 75, bodyFat: 22 },
    { date: '08/06/2025', value: 74.5, bodyFat: 21.5 },
    { date: '15/06/2025', value: 74, bodyFat: 21 },
    { date: '22/06/2025', value: 73.2, bodyFat: 20.5 },
    { date: '29/06/2025', value: 72.8, bodyFat: 20 },
  ];

  const workoutData = [
    { date: '01/06/2025', type: 'Cardio', duration: 30, calories: 250, intensity: 'Trung bình' },
    { date: '03/06/2025', type: 'Sức mạnh', duration: 45, calories: 320, intensity: 'Cao' },
    { date: '05/06/2025', type: 'Yoga', duration: 60, calories: 200, intensity: 'Thấp' },
    { date: '08/06/2025', type: 'Cardio', duration: 40, calories: 300, intensity: 'Cao' },
    { date: '10/06/2025', type: 'Sức mạnh', duration: 50, calories: 350, intensity: 'Cao' },
    { date: '12/06/2025', type: 'HIIT', duration: 25, calories: 280, intensity: 'Rất cao' },
    { date: '15/06/2025', type: 'Cardio', duration: 45, calories: 320, intensity: 'Trung bình' },
  ];

  const nutritionData = [
    { date: '01/06/2025', calories: 2100, protein: 120, carbs: 180, fat: 70 },
    { date: '02/06/2025', calories: 2050, protein: 125, carbs: 170, fat: 65 },
    { date: '03/06/2025', calories: 2200, protein: 130, carbs: 190, fat: 75 },
    { date: '04/06/2025', calories: 1950, protein: 115, carbs: 160, fat: 60 },
    { date: '05/06/2025', calories: 2000, protein: 120, carbs: 165, fat: 65 },
  ];

  // Dữ liệu biểu đồ mẫu - trong thực tế sẽ tính toán từ dữ liệu thực
  const progressSummary = {
    weightLoss: 2.2,
    bodyFatReduction: 2,
    workoutCount: 12,
    totalCaloriesBurned: 3500,
    averageCaloriesPerDay: 2060
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent to-purple-600 rounded-lg shadow-2xl p-6 text-white border border-accent/30">
        <h1 className="text-2xl font-bold mb-4">Detailed Progress Analysis</h1>
        <p>
          Track your training journey in detail with in-depth and personalized analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary-300 rounded-lg shadow-2xl p-4 border border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Weight Loss</p>
              <p className="text-2xl font-bold text-white">{progressSummary.weightLoss} kg</p>
            </div>
            <FaWeight className="text-accent text-2xl" />
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-lg shadow-2xl p-4 border border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Body Fat Reduction</p>
              <p className="text-2xl font-bold text-white">{progressSummary.bodyFatReduction}%</p>
            </div>
            <FaChartLine className="text-accent text-2xl" />
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-lg shadow-2xl p-4 border border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Workout Sessions</p>
              <p className="text-2xl font-bold text-white">{progressSummary.workoutCount}</p>
            </div>
            <FaRunning className="text-accent text-2xl" />
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-lg shadow-2xl p-4 border border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Calories Burned</p>
              <p className="text-2xl font-bold text-white">{progressSummary.totalCaloriesBurned}</p>
            </div>
            <FaHeartbeat className="text-accent text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-primary-300 rounded-lg shadow-2xl overflow-hidden border border-primary-100">
        <div className="flex border-b border-primary-100 overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
              activeTab === 'weight' ? 'text-accent border-b-2 border-accent' : 'text-gray-300'
            }`}
            onClick={() => setActiveTab('weight')}
          >
            <FaWeight className="mr-2" /> Weight & Body Metrics
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
              activeTab === 'workouts' ? 'text-accent border-b-2 border-accent' : 'text-gray-300'
            }`}
            onClick={() => setActiveTab('workouts')}
          >
            <FaRunning className="mr-2" /> Workouts
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
              activeTab === 'nutrition' ? 'text-accent border-b-2 border-accent' : 'text-gray-300'
            }`}
            onClick={() => setActiveTab('nutrition')}
          >
            <FaUtensils className="mr-2" /> Nutrition
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
              activeTab === 'analytics' ? 'text-accent border-b-2 border-accent' : 'text-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar className="mr-2" /> Analytics
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'weight' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Weight and Body Metrics History</h2>
                <button className="text-sm bg-accent text-white px-3 py-1 rounded-md hover:bg-accent/90 transition-colors">+ Add New</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-300 text-sm border-b border-primary-100">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Weight (kg)</th>
                      <th className="pb-3 font-medium">Body Fat %</th>
                      <th className="pb-3 font-medium">Weight Change</th>
                      <th className="pb-3 font-medium">Body Fat Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightData.map((item, index) => {
                      const prevValue = index > 0 ? weightData[index - 1].value : item.value;
                      const prevBodyFat = index > 0 ? weightData[index - 1].bodyFat : item.bodyFat;
                      const weightChange = item.value - prevValue;
                      const bodyFatChange = item.bodyFat - prevBodyFat;
                      return (
                        <tr key={index} className="border-b border-primary-100">
                          <td className="py-3 text-white">{item.date}</td>
                          <td className="py-3 text-white">{item.value}</td>
                          <td className="py-3 text-white">{item.bodyFat}%</td>
                          <td className="py-3">
                            {index > 0 && (
                              <span className={weightChange <= 0 ? 'text-green-400' : 'text-red-400'}>
                                {weightChange <= 0 ? '▼' : '▲'} {Math.abs(weightChange).toFixed(1)}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            {index > 0 && (
                              <span className={bodyFatChange <= 0 ? 'text-green-400' : 'text-red-400'}>
                                {bodyFatChange <= 0 ? '▼' : '▲'} {Math.abs(bodyFatChange).toFixed(1)}%
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
                <h2 className="text-lg font-semibold text-white">Detailed Workout Log</h2>
                <button className="text-sm bg-accent text-white px-3 py-1 rounded-md hover:bg-accent/90 transition-colors">+ Add Workout</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-300 text-sm border-b border-primary-100">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Workout Type</th>
                      <th className="pb-3 font-medium">Duration (min)</th>
                      <th className="pb-3 font-medium">Calories</th>
                      <th className="pb-3 font-medium">Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutData.map((workout, index) => (
                      <tr key={index} className="border-b border-primary-100">
                        <td className="py-3 text-white">{workout.date}</td>
                        <td className="py-3 text-white">{workout.type}</td>
                        <td className="py-3 text-white">{workout.duration}</td>
                        <td className="py-3 text-white">{workout.calories}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            workout.intensity === 'High' || workout.intensity === 'Very High' 
                              ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
                              : workout.intensity === 'Medium'
                                ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                                : 'bg-blue-900/30 text-blue-300 border border-blue-500/30'
                          }`}>
                            {workout.intensity === 'Cao' ? 'High' : 
                             workout.intensity === 'Rất cao' ? 'Very High' :
                             workout.intensity === 'Trung bình' ? 'Medium' :
                             workout.intensity === 'Thấp' ? 'Low' : workout.intensity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Nutrition Tracking</h2>
                <button className="text-sm bg-accent text-white px-3 py-1 rounded-md hover:bg-accent/90 transition-colors">+ Add Meal</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-300 text-sm border-b border-primary-100">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Calories</th>
                      <th className="pb-3 font-medium">Protein (g)</th>
                      <th className="pb-3 font-medium">Carbs (g)</th>
                      <th className="pb-3 font-medium">Fat (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutritionData.map((item, index) => (
                      <tr key={index} className="border-b border-primary-100">
                        <td className="py-3 text-white">{item.date}</td>
                        <td className="py-3 text-white">{item.calories}</td>
                        <td className="py-3 text-white">{item.protein}</td>
                        <td className="py-3 text-white">{item.carbs}</td>
                        <td className="py-3 text-white">{item.fat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-semibold text-white mb-2">Average Daily</h3>
                <p className="text-gray-300">Calories: {progressSummary.averageCaloriesPerDay} kcal</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Progress Analysis</h2>
                <p className="text-gray-300 mb-4">
                  Based on your data, we have analyzed your progress and provided the following recommendations:
                </p>
                
                <div className="bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-4 border border-blue-500/30">
                  <h3 className="font-semibold text-blue-300">Strengths</h3>
                  <ul className="mt-2 text-blue-200 space-y-1">
                    <li>• Consistent workout frequency</li>
                    <li>• Steady weight loss</li>
                    <li>• Good body fat reduction</li>
                  </ul>
                </div>
                
                <div className="bg-amber-900/20 border-l-4 border-amber-400 p-4 mb-4 border border-amber-500/30">
                  <h3 className="font-semibold text-amber-300">Areas for Improvement</h3>
                  <ul className="mt-2 text-amber-200 space-y-1">
                    <li>• Increase strength training</li>
                    <li>• Increase protein intake in your diet</li>
                    <li>• Add HIIT workouts for more effective fat burning</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Personalized Recommendations</h2>
                <p className="text-gray-300 mb-4">
                  Based on your goals and progress, our trainer recommends:
                </p>
                
                <div className="bg-primary-200 border border-primary-100 rounded-lg p-4">
                  <p className="italic text-gray-300">
                    "You are making good progress! To achieve your goal faster, I recommend increasing HIIT workouts to 2 times/week and adjusting your diet to increase protein to 1.5g/kg body weight per day. Please schedule an appointment with me to refine your training plan in detail."
                  </p>
                  <p className="mt-2 text-right text-sm font-medium text-gray-400">- Trainer Nguyen Van A</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-primary-300 rounded-lg shadow-2xl p-6 border border-primary-100">
        <h2 className="text-lg font-semibold text-white mb-4">Schedule Consultation</h2>
        <p className="text-gray-300 mb-4">
          Schedule an appointment with a personal trainer for in-depth consultation on your progress and training plan.
        </p>
        <button className="bg-accent hover:bg-accent/90 text-white rounded-md px-6 py-2 font-medium transition-colors">
          Schedule Now
        </button>
      </div>
    </div>
  );
} 