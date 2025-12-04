'use client'

import { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaCalendarAlt } from 'react-icons/fa';

export default function StandardTrainers() {
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // Dữ liệu mẫu - trong thực tế sẽ lấy từ database
  const trainers = [
    {
      id: 1,
      name: 'David Smith',
      specialty: 'Yoga & Pilates',
      experience: '5 năm',
      rating: 4.8,
      image: '/assets/img/trainers/david.jpg',
      bio: 'David là một huấn luyện viên yoga và pilates có kinh nghiệm với hơn 5 năm trong ngành. Anh ấy chuyên về các kỹ thuật thở và tăng cường sức mạnh cốt lõi.',
      availability: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
      classes: ['Yoga cơ bản', 'Pilates cho người mới', 'Yoga nâng cao']
    },
    {
      id: 2,
      name: 'Sofia Rodriguez',
      specialty: 'Cardio & HIIT',
      experience: '7 năm',
      rating: 4.9,
      image: '/assets/img/trainers/sofia.jpg',
      bio: 'Sofia là một huấn luyện viên năng động với chuyên môn về cardio và HIIT. Cô ấy sẽ giúp bạn đốt cháy calo và tăng cường sức bền một cách hiệu quả.',
      availability: ['Thứ 3', 'Thứ 5', 'Thứ 7'],
      classes: ['Cardio Blast', 'HIIT 30', 'Đốt mỡ toàn thân']
    },
    {
      id: 3,
      name: 'Matt Johnson',
      specialty: 'Sức mạnh & Điều kiện',
      experience: '6 năm',
      rating: 4.7,
      image: '/assets/img/trainers/matt.jpg',
      bio: 'Matt chuyên về đào tạo sức mạnh và điều kiện thể chất. Anh ấy giúp khách hàng xây dựng cơ bắp, tăng sức mạnh và cải thiện sức khỏe tổng thể.',
      availability: ['Thứ 2', 'Thứ 3', 'Thứ 7', 'Chủ nhật'],
      classes: ['Sức mạnh cơ bản', 'Nâng tạ', 'Circuit Training']
    },
    {
      id: 4,
      name: 'Rosy Chen',
      specialty: 'Giảm cân & Dinh dưỡng',
      experience: '4 năm',
      rating: 4.6,
      image: '/assets/img/trainers/rosy.jpg',
      bio: 'Rosy kết hợp đào tạo thể chất với tư vấn dinh dưỡng để giúp khách hàng đạt được mục tiêu giảm cân và duy trì lối sống lành mạnh.',
      availability: ['Thứ 4', 'Thứ 5', 'Thứ 6', 'Chủ nhật'],
      classes: ['Giảm cân toàn diện', 'Cardio nhẹ nhàng', 'Thể dục nhịp điệu']
    }
  ];

  const handleTrainerClick = (trainer: any) => {
    setSelectedTrainer(trainer);
  };

  const closeModal = () => {
    setSelectedTrainer(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Huấn luyện viên</h1>
        <p className="text-gray-600">
          Gặp gỡ đội ngũ huấn luyện viên chuyên nghiệp của chúng tôi. Nhấp vào mỗi huấn luyện viên để xem thêm thông tin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trainers.map((trainer) => (
          <div 
            key={trainer.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleTrainerClick(trainer)}
          >
            <div className="relative h-64 w-full">
              <Image 
                src={trainer.image} 
                alt={trainer.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{trainer.name}</h2>
              <p className="text-accent font-medium">{trainer.specialty}</p>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">
                  <FaStar />
                  <span className="ml-1 text-gray-700">{trainer.rating}</span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-gray-600">{trainer.experience}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thông tin lớp học sắp tới */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lớp học sắp tới</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">Lớp học</th>
                <th className="pb-3 font-medium">Huấn luyện viên</th>
                <th className="pb-3 font-medium">Ngày</th>
                <th className="pb-3 font-medium">Giờ</th>
                <th className="pb-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Yoga cơ bản</td>
                <td className="py-3">David Smith</td>
                <td className="py-3">Thứ 2, 19/06</td>
                <td className="py-3">9:00 - 10:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Còn chỗ</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">HIIT 30</td>
                <td className="py-3">Sofia Rodriguez</td>
                <td className="py-3">Thứ 3, 20/06</td>
                <td className="py-3">18:00 - 18:30</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Đã đầy</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Sức mạnh cơ bản</td>
                <td className="py-3">Matt Johnson</td>
                <td className="py-3">Thứ 4, 21/06</td>
                <td className="py-3">17:00 - 18:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Còn chỗ</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Cardio nhẹ nhàng</td>
                <td className="py-3">Rosy Chen</td>
                <td className="py-3">Thứ 5, 22/06</td>
                <td className="py-3">10:00 - 11:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Sắp đầy</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thông tin huấn luyện viên */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="h-64 w-full relative">
                <Image 
                  src={selectedTrainer.image} 
                  alt={selectedTrainer.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md"
                onClick={closeModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTrainer.name}</h2>
              <p className="text-accent font-medium">{selectedTrainer.specialty}</p>
              
              <div className="flex items-center mt-2 mb-4">
                <div className="flex text-yellow-400">
                  <FaStar />
                  <span className="ml-1 text-gray-700">{selectedTrainer.rating}</span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-gray-600">Kinh nghiệm: {selectedTrainer.experience}</span>
              </div>
              
              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Giới thiệu</h3>
              <p className="text-gray-600 mb-4">{selectedTrainer.bio}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Lịch làm việc</h3>
                  <ul className="space-y-1">
                    {selectedTrainer.availability.map((day: any, index: number) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <FaCalendarAlt className="text-accent mr-2" /> {day}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Lớp học</h3>
                  <ul className="space-y-1">
                    {selectedTrainer.classes.map((className: any, index: number) => (
                      <li key={index} className="text-gray-600">• {className}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  * Để đặt lịch tập cá nhân, vui lòng nâng cấp lên gói Premium
                </p>
                <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed">
                  Đặt lịch tập
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 