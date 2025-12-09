export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

export const mockReviews: { [productId: string]: Review[] } = {
  '1': [
    {
      id: 'r1',
      userId: 'u1',
      userName: 'Michael Chen',
      rating: 5,
      title: 'Perfect for intense workouts',
      comment: 'This shirt keeps me dry even during my toughest CrossFit sessions. The fabric is incredibly breathable and the fit is just right - not too tight, not too loose. Highly recommend!',
      date: '2024-01-15',
      verified: true,
      helpful: 24,
    },
    {
      id: 'r2',
      userId: 'u2',
      userName: 'Sarah Johnson',
      rating: 5,
      title: 'Great quality!',
      comment: 'Love the moisture-wicking technology. The shirt stays fresh all day and the material is very comfortable against the skin.',
      date: '2024-01-10',
      verified: true,
      helpful: 18,
    },
    {
      id: 'r3',
      userId: 'u3',
      userName: 'David Rodriguez',
      rating: 4,
      title: 'Good but runs slightly small',
      comment: 'Quality is excellent and it performs well. I would recommend ordering one size up if you prefer a looser fit.',
      date: '2024-01-08',
      verified: true,
      helpful: 12,
    },
    {
      id: 'r4',
      userId: 'u4',
      userName: 'Emily Watson',
      rating: 5,
      title: 'Best training shirt I own',
      comment: 'The anti-odor treatment really works! After multiple washes, it still looks and smells great. The stretchy material moves with you perfectly.',
      date: '2024-01-05',
      verified: true,
      helpful: 31,
    },
  ],
  '2': [
    {
      id: 'r5',
      userId: 'u5',
      userName: 'Jessica Martinez',
      rating: 5,
      title: 'Amazing leggings!',
      comment: 'These are hands down the best leggings I\'ve ever owned. They\'re squat-proof, non-see-through, and the pocket is perfect for my phone. Worth every penny!',
      date: '2024-01-18',
      verified: true,
      helpful: 42,
    },
    {
      id: 'r6',
      userId: 'u6',
      userName: 'Amanda Lee',
      rating: 5,
      title: 'Perfect fit and quality',
      comment: 'The high-waist design provides great tummy control and they stay in place during yoga. Very comfortable and flattering!',
      date: '2024-01-12',
      verified: true,
      helpful: 28,
    },
    {
      id: 'r7',
      userId: 'u7',
      userName: 'Lisa Brown',
      rating: 4,
      title: 'Great for yoga',
      comment: 'Love these leggings for my yoga practice. Only giving 4 stars because I wish they came in more colors.',
      date: '2024-01-06',
      verified: true,
      helpful: 15,
    },
  ],
  '6': [
    {
      id: 'r8',
      userId: 'u8',
      userName: 'Rachel Green',
      rating: 5,
      title: 'Perfect for CrossFit',
      comment: 'These shoes provide excellent stability for lifting while still being flexible enough for box jumps and burpees. The wide toe box is a game changer!',
      date: '2024-01-20',
      verified: true,
      helpful: 38,
    },
    {
      id: 'r9',
      userId: 'u9',
      userName: 'Monica Taylor',
      rating: 5,
      title: 'Best training shoes',
      comment: 'I\'ve tried many training shoes and these are by far the best. Great for weightlifting with enough cushioning for cardio. Very durable!',
      date: '2024-01-14',
      verified: true,
      helpful: 29,
    },
  ],
  '15': [
    {
      id: 'r10',
      userId: 'u10',
      userName: 'John Smith',
      rating: 5,
      title: 'Excellent treadmill',
      comment: 'Worth every dollar! The motor is powerful and quiet, and the running surface is spacious. Assembly was straightforward. Great for my home gym!',
      date: '2024-01-22',
      verified: true,
      helpful: 56,
    },
    {
      id: 'r11',
      userId: 'u11',
      userName: 'Robert Wilson',
      rating: 4,
      title: 'Great machine, heavy delivery',
      comment: 'The treadmill itself is fantastic with lots of features. Only downside was it\'s very heavy and took two people to move it upstairs.',
      date: '2024-01-16',
      verified: true,
      helpful: 23,
    },
    {
      id: 'r12',
      userId: 'u12',
      userName: 'Jennifer Davis',
      rating: 5,
      title: 'Professional quality',
      comment: 'This feels like a commercial gym treadmill. The programs are varied and the heart rate monitor is accurate. Folds up nicely too!',
      date: '2024-01-11',
      verified: true,
      helpful: 34,
    },
  ],
  '28': [
    {
      id: 'r13',
      userId: 'u13',
      userName: 'Ashley Thompson',
      rating: 5,
      title: 'Best support!',
      comment: 'Finally found a sports bra that provides excellent support without being uncomfortable. Perfect for running and HIIT workouts!',
      date: '2024-01-19',
      verified: true,
      helpful: 41,
    },
    {
      id: 'r14',
      userId: 'u14',
      userName: 'Michelle Garcia',
      rating: 5,
      title: 'Super comfortable',
      comment: 'Love the adjustable straps and removable pads. The material is breathable and it stays in place during my entire workout. Highly recommend!',
      date: '2024-01-13',
      verified: true,
      helpful: 27,
    },
  ],
};

export function getProductReviews(productId: string): {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
} {
  const reviews = mockReviews[productId] || [];
  
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  return {
    reviews,
    averageRating,
    totalReviews,
  };
}

export default mockReviews;
