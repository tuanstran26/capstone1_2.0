'use client'
import { useState } from 'react';
import ProductGrid from '@/components/shopping/ProductGrid';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/variants';
import { exerciseProducts } from '@/lib/productsData';

const categories = ['All', 'Strength Training', 'Cardio & Fitness', 'Yoga & Pilates', 'Recovery', 'Core Training'];

export default function ShoppingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on category and search
  const filteredProducts = exerciseProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        variants={fadeIn('down', 0.2)}
        initial="hidden"
        animate="show"
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-accent">Exercise</span> Equipment Shop
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Find the best exercise equipment for your fitness journey. Quality products at affordable prices.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        variants={fadeIn('up', 0.3)}
        initial="hidden"
        animate="show"
        className="mb-8 max-w-xl mx-auto"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-accent focus:outline-none text-gray-700 placeholder-gray-400"
          />
          <svg
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        variants={fadeIn('up', 0.4)}
        initial="hidden"
        animate="show"
        className="mb-12"
      >
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-accent text-white scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Product Count */}
      <motion.div
        variants={fadeIn('up', 0.5)}
        initial="hidden"
        animate="show"
        className="mb-6"
      >
        <p className="text-gray-600 text-center">
          Showing <span className="font-bold text-accent">{filteredProducts.length}</span> products
        </p>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <motion.div
          variants={fadeIn('up', 0.6)}
          initial="hidden"
          animate="show"
          className="text-center py-20"
        >
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </motion.div>
      )}
    </div>
  );
}
