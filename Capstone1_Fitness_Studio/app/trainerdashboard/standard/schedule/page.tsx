'use client'

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaFilter } from 'react-icons/fa';
import { GiMeditation, GiWeightLiftingUp } from 'react-icons/gi';

interface ClassSession {
  id: number;
  name: string;
  trainer: string;
  time: string;
  duration: string;
  location: string;
  date: string;
  day: string;
  capacity: number;
  enrolled: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Yoga' | 'Fitness';
  nhom: string;
  dayOfWeek: number; // 0: Chủ nhật, 1-6: Thứ 2 - Thứ 7
}

export default function StandardSchedule() {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWeekDates, setCurrentWeekDates] = useState<Date[]>([]);
  const [registeredClasses, setRegisteredClasses] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>('schedule');

  // Tạo mảng 7 ngày từ ngày hiện tại
  const generateWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Khởi tạo ngày hiện tại và tuần hiện tại
  useEffect(() => {
    const today = new Date();
    // Đặt ngày bắt đầu tuần là thứ 2
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là chủ nhật (0), lùi 6 ngày, ngược lại lùi về thứ 2
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    
    setCurrentWeekDates(generateWeekDates(monday));
    setSelectedDay(today);
  }, []);

  // Dữ liệu mẫu - trong thực tế sẽ lấy từ database
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  const classes: ClassSession[] = [
    {
      id: 1,
      name: 'Yoga cơ bản',
      trainer: 'David Smith',
      time: '07:30 - 08:30',
      duration: '60 phút',
      location: '104.B08-Phòng học vừa',
      date: '19/06/2025',
      day: 'Thứ 2',
      capacity: 20,
      enrolled: 12,
      level: 'Beginner',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 1
    },
    {
      id: 2,
      name: 'Fitness toàn thân',
      trainer: 'Sofia Rodriguez',
      time: '17:30 - 18:30',
      duration: '60 phút',
      location: '201.B08-Phòng học vừa',
      date: '19/06/2025',
      day: 'Thứ 2',
      capacity: 15,
      enrolled: 10,
      level: 'Intermediate',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 1
    },
    {
      id: 3,
      name: 'Yoga nâng cao',
      trainer: 'Maria Lopez',
      time: '09:30 - 10:30',
      duration: '60 phút',
      location: '201.B08-Phòng học vừa',
      date: '20/06/2025',
      day: 'Thứ 3',
      capacity: 15,
      enrolled: 15,
      level: 'Advanced',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 2
    },
    {
      id: 4,
      name: 'Fitness HIIT',
      trainer: 'Matt Johnson',
      time: '18:30 - 19:30',
      duration: '60 phút',
      location: '201.B08-Phòng học vừa',
      date: '20/06/2025',
      day: 'Thứ 3',
      capacity: 12,
      enrolled: 8,
      level: 'Advanced',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 2
    },
    {
      id: 5,
      name: 'Yoga thiền',
      trainer: 'Sofia Wilson',
      time: '07:30 - 08:30',
      duration: '60 phút',
      location: 'LAB408.B11-Lab máy tính',
      date: '21/06/2025',
      day: 'Thứ 4',
      capacity: 20,
      enrolled: 15,
      level: 'Beginner',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 3
    },
    {
      id: 6,
      name: 'Fitness Core',
      trainer: 'David Johnson',
      time: '12:30 - 13:30',
      duration: '60 phút',
      location: '314.B11-Lab máy tính',
      date: '21/06/2025',
      day: 'Thứ 4',
      capacity: 15,
      enrolled: 10,
      level: 'Intermediate',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 3
    },
    {
      id: 7,
      name: 'Yoga phục hồi',
      trainer: 'Maria Lopez',
      time: '16:30 - 17:30',
      duration: '60 phút',
      location: 'LAB408.B11-Lab máy tính',
      date: '22/06/2025',
      day: 'Thứ 5',
      capacity: 15,
      enrolled: 10,
      level: 'Beginner',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 4
    },
    {
      id: 8,
      name: 'Fitness Cardio',
      trainer: 'Mike Tyson',
      time: '18:30 - 19:30',
      duration: '60 phút',
      location: 'ONLINE1-TN CNTT',
      date: '22/06/2025',
      day: 'Thứ 5',
      capacity: 15,
      enrolled: 10,
      level: 'Intermediate',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 4
    },
    {
      id: 9,
      name: 'Yoga Power',
      trainer: 'Sofia Wilson',
      time: '07:30 - 08:30',
      duration: '60 phút',
      location: '104.B08-Phòng học vừa',
      date: '23/06/2025',
      day: 'Thứ 6',
      capacity: 15,
      enrolled: 10,
      level: 'Advanced',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 5
    },
    {
      id: 10,
      name: 'Fitness Strength',
      trainer: 'David Johnson',
      time: '17:30 - 18:30',
      duration: '60 phút',
      location: '201.B08-Phòng học vừa',
      date: '23/06/2025',
      day: 'Thứ 6',
      capacity: 15,
      enrolled: 10,
      level: 'Advanced',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 5
    },
    {
      id: 11,
      name: 'Yoga cho mọi người',
      trainer: 'Maria Lopez',
      time: '09:30 - 10:30',
      duration: '60 phút',
      location: 'LAB404.B11-Lab máy tính',
      date: '24/06/2025',
      day: 'Thứ 7',
      capacity: 20,
      enrolled: 15,
      level: 'Beginner',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 6
    },
    {
      id: 12,
      name: 'Fitness toàn diện',
      trainer: 'Mike Tyson',
      time: '16:30 - 17:30',
      duration: '60 phút',
      location: 'LAB404.B11-Lab máy tính',
      date: '24/06/2025',
      day: 'Thứ 7',
      capacity: 20,
      enrolled: 15,
      level: 'Intermediate',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 6
    },
    {
      id: 13,
      name: 'Yoga thư giãn',
      trainer: 'Sofia Wilson',
      time: '09:30 - 10:30',
      duration: '60 phút',
      location: 'LAB404.B11-Lab máy tính',
      date: '25/06/2025',
      day: 'Chủ nhật',
      capacity: 20,
      enrolled: 10,
      level: 'Beginner',
      category: 'Yoga',
      nhom: '01',
      dayOfWeek: 0
    },
    {
      id: 14,
      name: 'Fitness nhẹ nhàng',
      trainer: 'Maria Lopez',
      time: '16:30 - 17:30',
      duration: '60 phút',
      location: 'LAB404.B11-Lab máy tính',
      date: '25/06/2025',
      day: 'Chủ nhật',
      capacity: 15,
      enrolled: 8,
      level: 'Beginner',
      category: 'Fitness',
      nhom: '01',
      dayOfWeek: 0
    },
  ];

  const categories = ['Yoga', 'Fitness'];

  // Chuyển đến tuần trước
  const goToPreviousWeek = () => {
    if (currentWeekDates.length === 0) return;
    const prevWeekStart = new Date(currentWeekDates[0]);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    setCurrentWeekDates(generateWeekDates(prevWeekStart));
  };

  // Chuyển đến tuần sau
  const goToNextWeek = () => {
    if (currentWeekDates.length === 0) return;
    const nextWeekStart = new Date(currentWeekDates[0]);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    setCurrentWeekDates(generateWeekDates(nextWeekStart));
  };

  // Kiểm tra xem một ngày có phải là ngày được chọn không
  const isSelectedDate = (date: Date) => {
    return selectedDay && date.toDateString() === selectedDay.toDateString();
  };

  // Lọc lớp học theo ngày và danh mục
  const filteredClasses = classes.filter(c => {
    if (!selectedDay) return false;
    
    const dayMatch = c.dayOfWeek === selectedDay.getDay();
    const categoryMatch = selectedCategory ? c.category === selectedCategory : true;
    
    return dayMatch && categoryMatch;
  });

  // Lấy các lớp học cho một khung giờ và ngày cụ thể
  const getClassesForTimeSlot = (timeSlot: string, date: Date) => {
    const dayOfWeek = date.getDay();
    return classes.filter(cls => {
      const dayMatch = cls.dayOfWeek === dayOfWeek;
      const timeMatch = cls.time === timeSlot;
      const categoryMatch = selectedCategory ? cls.category === selectedCategory : true;
      return dayMatch && timeMatch && categoryMatch;
    });
  };

  // Đăng ký lớp học
  const handleEnroll = (classId: number) => {
    if (registeredClasses.includes(classId)) {
      setRegisteredClasses(registeredClasses.filter(id => id !== classId));
    } else {
      setRegisteredClasses([...registeredClasses, classId]);
    }
    // Trong thực tế, đây sẽ là API call để đăng ký lớp học
    alert(`${registeredClasses.includes(classId) ? 'Đã hủy đăng ký' : 'Đã đăng ký'} lớp học #${classId}`);
  };

  // Chỉ hiển thị nếu đã tải dữ liệu
  if (currentWeekDates.length === 0 || !selectedDay) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Lịch tập luyện</h1>
        <p className="text-gray-600">
          Xem và đăng ký các lớp học sắp tới. Nhấp vào một lớp học để đăng ký.
        </p>
      </div>

      {/* Điều hướng tuần và chế độ xem */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={goToPreviousWeek}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-l-md hover:bg-gray-50"
            >
              <FaChevronLeft className="mr-2" />
              <span>Tuần trước</span>
            </button>

            <button 
              onClick={goToNextWeek}
              className="flex items-center px-3 py-2 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-50"
            >
              <span>Tuần sau</span>
              <FaChevronRight className="ml-2" />
            </button>
          </div>

          <h2 className="text-lg font-medium">
            {`${currentWeekDates[0].toLocaleDateString('vi-VN')} - ${currentWeekDates[6].toLocaleDateString('vi-VN')}`}
          </h2>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Danh sách
            </button>
            <button 
              onClick={() => setViewMode('schedule')}
              className={`px-3 py-2 rounded-md ${
                viewMode === 'schedule' 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Thời khóa biểu
            </button>
          </div>
        </div>
      </div>

      {/* Bộ lọc loại lớp học */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <FaFilter className="mr-2 text-gray-500" />
            <span className="font-medium">Lọc:</span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                selectedCategory === null 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            
            <button
              onClick={() => setSelectedCategory('Yoga')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                selectedCategory === 'Yoga' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <GiMeditation className="mr-1" />
              Yoga
            </button>
            
            <button
              onClick={() => setSelectedCategory('Fitness')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                selectedCategory === 'Fitness' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <GiWeightLiftingUp className="mr-1" />
              Fitness
            </button>
          </div>
        </div>
      </div>

      {/* Chọn ngày trong tuần */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-7 gap-1">
          {currentWeekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = isSelectedDate(date);
            const dayOfWeek = date.getDay();
            const classesForDay = classes.filter(cls => cls.dayOfWeek === dayOfWeek);
            const hasYogaClass = classesForDay.some(cls => cls.category === 'Yoga');
            const hasFitnessClass = classesForDay.some(cls => cls.category === 'Fitness');
            
            return (
              <div 
                key={index} 
                onClick={() => setSelectedDay(date)}
                className={`cursor-pointer p-3 rounded-lg text-center transition-all ${
                  isSelected 
                    ? 'bg-accent text-white shadow-md' 
                    : isToday
                      ? 'bg-accent/10 border border-accent'
                      : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
              >
                <p className="font-medium">{dayMap[date.getDay()]}</p>
                <p className={`text-xl font-bold ${isSelected ? 'text-white' : ''}`}>
                  {date.getDate()}
                </p>
                <p className="text-xs mb-2">{date.toLocaleDateString('vi-VN', { month: 'short' })}</p>
                
                {/* Indicators for class types */}
                <div className="flex justify-center space-x-1">
                  {hasYogaClass && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`}></span>
                  )}
                  {hasFitnessClass && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Chế độ xem danh sách */
        <div className="space-y-4">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => (
              <div key={classItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {classItem.category === 'Yoga' ? (
                        <GiMeditation className="text-purple-500 mr-2 text-xl" />
                      ) : (
                        <GiWeightLiftingUp className="text-blue-500 mr-2 text-xl" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{classItem.name}</h3>
                        <p className="text-accent">{classItem.trainer}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      classItem.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      classItem.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {classItem.level === 'Beginner' ? 'Người mới' :
                      classItem.level === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-accent" />
                      <span>{classItem.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-accent" />
                      <span>{classItem.time} ({classItem.duration})</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-accent" />
                      <span>{classItem.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-accent" />
                        <span className="text-gray-600 text-sm">
                          Nhóm: {classItem.nhom} | {classItem.enrolled}/{classItem.capacity} người đã đăng ký
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            classItem.enrolled / classItem.capacity >= 0.9 ? 'bg-red-500' :
                            classItem.enrolled / classItem.capacity >= 0.7 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      className={`px-4 py-2 rounded-md ${
                        registeredClasses.includes(classItem.id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : classItem.enrolled >= classItem.capacity
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-accent hover:bg-accent/90 text-white'
                      }`}
                      onClick={() => handleEnroll(classItem.id)}
                      disabled={!registeredClasses.includes(classItem.id) && classItem.enrolled >= classItem.capacity}
                    >
                      {registeredClasses.includes(classItem.id) 
                        ? 'Hủy đăng ký' 
                        : classItem.enrolled >= classItem.capacity 
                          ? 'Đã đầy' 
                          : 'Đăng ký'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Không có lớp học nào vào ngày này.</p>
            </div>
          )}
        </div>
      ) : (
        /* Chế độ xem thời khóa biểu */
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Thời khóa biểu tuần</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 py-2 px-2 border bg-gray-50"></th>
                  {currentWeekDates.map((date, index) => {
                    const dayName = dayMap[date.getDay()];
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = isSelectedDate(date);
                    return (
                      <th 
                        key={index} 
                        className={`py-2 px-2 border text-center ${
                          isSelected 
                            ? 'bg-accent text-white' 
                            : isToday 
                              ? 'bg-accent/10' 
                              : 'bg-gray-50'
                        }`}
                        onClick={() => setSelectedDay(date)}
                      >
                        <div className="font-medium">{dayName}</div>
                        <div className="font-bold">{date.getDate()}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Tạo các khung giờ từ 7:30 đến 19:30 */}
                {[
                  '07:30 - 08:30', 
                  '08:30 - 09:30', 
                  '09:30 - 10:30', 
                  '10:30 - 11:30',
                  '11:30 - 12:30',
                  '12:30 - 13:30',
                  '13:30 - 14:30',
                  '14:30 - 15:30',
                  '15:30 - 16:30',
                  '16:30 - 17:30',
                  '17:30 - 18:30',
                  '18:30 - 19:30',
                  '19:30 - 20:00'
                ].map((timeSlot, timeIndex) => (
                  <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-1 px-2 border font-medium text-sm text-center">{timeSlot}</td>
                    
                    {currentWeekDates.map((date, dateIndex) => {
                      const classesAtTime = getClassesForTimeSlot(timeSlot, date);
                      
                      if (classesAtTime.length === 0) {
                        return <td key={dateIndex} className="border p-1 min-h-[60px]"></td>;
                      }
                      
                      return (
                        <td key={dateIndex} className="border p-1">
                          {classesAtTime.map(cls => (
                            <div 
                              key={cls.id} 
                              className={`${
                                cls.category === 'Yoga' 
                                  ? 'bg-purple-100 border-l-4 border-purple-500' 
                                  : 'bg-blue-100 border-l-4 border-blue-500'
                              } p-2 rounded-sm mb-1 text-sm`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium flex items-center">
                                  {cls.category === 'Yoga' ? (
                                    <GiMeditation className="text-purple-500 mr-1" />
                                  ) : (
                                    <GiWeightLiftingUp className="text-blue-500 mr-1" />
                                  )}
                                  {cls.name}
                                </div>
                                <button
                                  onClick={() => handleEnroll(cls.id)}
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    registeredClasses.includes(cls.id)
                                      ? 'bg-red-500 text-white'
                                      : 'bg-accent text-white'
                                  }`}
                                >
                                  {registeredClasses.includes(cls.id) ? 'Hủy' : 'Đăng ký'}
                                </button>
                              </div>
                              <div className="text-xs mt-1">Nhóm: {cls.nhom}</div>
                              <div className="text-xs">{cls.location}</div>
                              <div className="text-xs">GV: {cls.trainer}</div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-100 border-l-2 border-purple-500 mr-1"></div>
              <span className="text-sm">Yoga</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 mr-1"></div>
              <span className="text-sm">Fitness</span>
            </div>
          </div>
        </div>
      )}

      {/* Lớp học đã đăng ký */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lớp học đã đăng ký</h2>
        {registeredClasses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Lớp học</th>
                  <th className="pb-3 font-medium">Huấn luyện viên</th>
                  <th className="pb-3 font-medium">Ngày</th>
                  <th className="pb-3 font-medium">Giờ</th>
                  <th className="pb-3 font-medium">Địa điểm</th>
                  <th className="pb-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {classes.filter(cls => registeredClasses.includes(cls.id)).map(cls => (
                  <tr key={cls.id} className="border-b">
                    <td className="py-3">
                      <div className="flex items-center">
                        {cls.category === 'Yoga' ? (
                          <GiMeditation className="text-purple-500 mr-2" />
                        ) : (
                          <GiWeightLiftingUp className="text-blue-500 mr-2" />
                        )}
                        {cls.name}
                      </div>
                    </td>
                    <td className="py-3">{cls.trainer}</td>
                    <td className="py-3">{cls.day}, {cls.date}</td>
                    <td className="py-3">{cls.time}</td>
                    <td className="py-3">{cls.location}</td>
                    <td className="py-3">
                      <button 
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        onClick={() => handleEnroll(cls.id)}
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Bạn chưa đăng ký lớp học nào.</p>
        )}
      </div>
    </div>
  );
} 