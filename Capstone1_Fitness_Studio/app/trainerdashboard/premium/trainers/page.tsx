'use client'

import { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaCalendarAlt, FaCheck } from 'react-icons/fa';

// Định nghĩa kiểu dữ liệu cho trainer
interface Trainer {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  image: string;
  bio: string;
  availability: string[];
  classes: string[];
  privateSessionPrice?: number;
  specialties?: string[];
}

export default function PremiumTrainers() {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [bookingMode, setBookingMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Dữ liệu mẫu - trong thực tế sẽ lấy từ database
  const trainers: Trainer[] = [
    {
      id: 1,
      name: 'David Smith',
      specialty: 'Yoga & Pilates',
      experience: '5 năm',
      rating: 4.8,
      image: '/assets/img/trainers/david.jpg',
      bio: 'David là một huấn luyện viên yoga và pilates có kinh nghiệm với hơn 5 năm trong ngành. Anh ấy chuyên về các kỹ thuật thở và tăng cường sức mạnh cốt lõi.',
      availability: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
      classes: ['Yoga cơ bản', 'Pilates cho người mới', 'Yoga nâng cao'],
      privateSessionPrice: 350000,
      specialties: ['Yoga', 'Pilates', 'Thiền', 'Linh hoạt']
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
      classes: ['Cardio Blast', 'HIIT 30', 'Đốt mỡ toàn thân'],
      privateSessionPrice: 400000,
      specialties: ['HIIT', 'Cardio', 'Giảm cân', 'Sức bền']
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
      classes: ['Sức mạnh cơ bản', 'Nâng tạ', 'Circuit Training'],
      privateSessionPrice: 380000,
      specialties: ['Tăng cơ', 'Sức mạnh', 'Bodybuilding', 'Powerlifting']
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
      classes: ['Giảm cân toàn diện', 'Cardio nhẹ nhàng', 'Thể dục nhịp điệu'],
      privateSessionPrice: 350000,
      specialties: ['Dinh dưỡng', 'Giảm cân', 'Thể dục nhịp điệu', 'Sức khỏe tổng thể']
    }
  ];

  const availableTimes = [
    '7:00 - 8:00', '8:00 - 9:00', '9:00 - 10:00', '10:00 - 11:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00'
  ];

  const handleTrainerClick = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setBookingMode(false);
  };

  const closeModal = () => {
    setSelectedTrainer(null);
    setBookingMode(false);
  };

  const startBooking = () => {
    setBookingMode(true);
  };

  const handleBookSession = () => {
    // Xử lý đặt lịch - trong thực tế sẽ gửi dữ liệu đến server
    alert(`Đã đặt lịch tập với ${selectedTrainer?.name} vào ${selectedDate} lúc ${selectedTime}`);
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Huấn luyện viên Premium</h1>
        <p>
          Gặp gỡ đội ngũ huấn luyện viên chuyên nghiệp của chúng tôi. Với gói Premium, bạn có thể đặt lịch tập cá nhân với bất kỳ huấn luyện viên nào.
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
              <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                Premium
              </div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Lớp học độc quyền Premium</h2>
          <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md text-sm font-medium">
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">Lớp học</th>
                <th className="pb-3 font-medium">Huấn luyện viên</th>
                <th className="pb-3 font-medium">Ngày</th>
                <th className="pb-3 font-medium">Giờ</th>
                <th className="pb-3 font-medium">Loại</th>
                <th className="pb-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Yoga nâng cao</td>
                <td className="py-3">David Smith</td>
                <td className="py-3">Thứ 2, 19/06</td>
                <td className="py-3">9:00 - 10:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Premium</span>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Còn chỗ</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">HIIT Intense</td>
                <td className="py-3">Sofia Rodriguez</td>
                <td className="py-3">Thứ 3, 20/06</td>
                <td className="py-3">18:00 - 19:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Premium</span>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Còn chỗ</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Powerlifting</td>
                <td className="py-3">Matt Johnson</td>
                <td className="py-3">Thứ 4, 21/06</td>
                <td className="py-3">17:00 - 18:30</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Premium</span>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Sắp đầy</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Tư vấn dinh dưỡng</td>
                <td className="py-3">Rosy Chen</td>
                <td className="py-3">Thứ 5, 22/06</td>
                <td className="py-3">10:00 - 11:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Premium</span>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Còn chỗ</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Buổi tập cá nhân đã đặt */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Buổi tập cá nhân của bạn</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">Huấn luyện viên</th>
                <th className="pb-3 font-medium">Ngày</th>
                <th className="pb-3 font-medium">Giờ</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Sofia Rodriguez</td>
                <td className="py-3">Thứ 5, 22/06</td>
                <td className="py-3">15:00 - 16:00</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Đã xác nhận</span>
                </td>
                <td className="py-3">
                  <button className="text-red-500 hover:text-red-700 text-sm font-medium">Hủy</button>
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
            {!bookingMode ? (
              <>
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
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Chuyên môn</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrainer.specialties?.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Lịch làm việc</h3>
                      <ul className="space-y-1">
                        {selectedTrainer.availability.map((day, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <FaCalendarAlt className="text-accent mr-2" /> {day}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Lớp học</h3>
                      <ul className="space-y-1">
                        {selectedTrainer.classes.map((className, index) => (
                          <li key={index} className="text-gray-600">• {className}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-800">Buổi tập cá nhân</p>
                        <p className="text-gray-600">{selectedTrainer.privateSessionPrice?.toLocaleString()} VNĐ / buổi</p>
                      </div>
                      <button 
                        className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md"
                        onClick={startBooking}
                      >
                        Đặt lịch tập
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Đặt lịch tập với {selectedTrainer.name}</h2>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setBookingMode(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Chọn ngày</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    >
                      <option value="">Chọn ngày</option>
                      {selectedTrainer.availability.map((day, index) => (
                        <option key={index} value={`${day}, 23/06/2025`}>{day}, 23/06/2025</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Chọn giờ</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate}
                    >
                      <option value="">Chọn giờ</option>
                      {availableTimes.map((time, index) => (
                        <option key={index} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-4 mt-4">
                    <h3 className="font-medium text-gray-800 mb-2">Chi tiết buổi tập</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-600">
                        <FaCheck className="text-green-500 mr-2" /> Buổi tập 60 phút
                      </li>
                      <li className="flex items-center text-gray-600">
                        <FaCheck className="text-green-500 mr-2" /> Tùy chỉnh theo mục tiêu cá nhân
                      </li>
                      <li className="flex items-center text-gray-600">
                        <FaCheck className="text-green-500 mr-2" /> Theo dõi tiến độ
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Giá buổi tập:</span>
                      <span className="font-medium">{selectedTrainer.privateSessionPrice?.toLocaleString()} VNĐ</span>
                    </div>
                    
                    <button 
                      className={`w-full py-2 rounded-md mt-4 font-medium ${
                        selectedDate && selectedTime 
                          ? 'bg-accent hover:bg-accent/90 text-white' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={handleBookSession}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Xác nhận đặt lịch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 