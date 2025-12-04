'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiThumbsUp, FiUser, FiCheck } from 'react-icons/fi';

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

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ProductReviews = ({ productId, reviews, averageRating, totalReviews }: ProductReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  // Sort and filter reviews
  let filteredReviews = [...reviews];
  if (filterRating) {
    filteredReviews = filteredReviews.filter(r => r.rating === filterRating);
  }
  
  filteredReviews.sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center border-r border-gray-200">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-6 h-6 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-gray-600">Based on {totalReviews} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors ${
                  filterRating === star ? 'bg-accent/10' : ''
                }`}
              >
                <span className="text-sm font-medium text-gray-700 w-12">{star} star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="w-full mt-6 bg-gradient-to-r from-accent to-accent-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </motion.button>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ReviewForm productId={productId} onSubmit={() => setShowReviewForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Options */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {filterRating ? `${filterRating} Star Reviews` : 'All Reviews'} ({filteredReviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <ReviewCard key={review.id} review={review} index={index} />
        ))}
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const [helpful, setHelpful] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpful(helpful + 1);
      setHasVoted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center text-white font-bold">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <FiUser className="w-6 h-6" />
            )}
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900">{review.userName}</h4>
              {review.verified && (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <FiCheck className="w-3 h-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="font-bold text-lg text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Review Comment */}
      <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Review ${idx + 1}`}
              className="w-24 h-24 object-cover rounded-lg hover:scale-110 transition-transform cursor-pointer"
            />
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            hasVoted ? 'text-accent' : 'text-gray-600 hover:text-accent'
          }`}
        >
          <FiThumbsUp className="w-4 h-4" />
          Helpful ({helpful})
        </button>
      </div>
    </motion.div>
  );
};

// Review Form Component
const ReviewForm = ({ productId, onSubmit }: { productId: string; onSubmit: () => void }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the review to your backend
    const newReview = {
      productId,
      rating,
      title,
      comment,
      userName,
      date: new Date().toISOString(),
    };
    
    console.log('New Review:', newReview);
    
    // Reset form
    setRating(0);
    setTitle('');
    setComment('');
    setUserName('');
    onSubmit();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Write Your Review</h3>

      {/* Rating Stars */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <FiStar
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
          placeholder="John Doe"
        />
      </div>

      {/* Review Title */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Review Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
          placeholder="Great product, highly recommend!"
        />
      </div>

      {/* Review Comment */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent resize-none"
          placeholder="Share your experience with this product..."
        />
        <p className="text-xs text-gray-500 mt-2">Minimum 50 characters</p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={rating === 0 || !title || !comment || !userName || comment.length < 50}
          className="flex-1 bg-gradient-to-r from-accent to-accent-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </motion.button>
      </div>
    </motion.form>
  );
};

export default ProductReviews;
