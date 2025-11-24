'use client'
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/variants';
import { useCart } from '@/lib/CartContext';
import { useState } from 'react';
import { FiCheck, FiShoppingCart } from 'react-icons/fi';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Multiple images for gallery
  category: string;
  rating: number;
  inStock: boolean;
  features?: string[]; // Product features list
  specifications?: { [key: string]: string }; // Product specs
}

interface ProductCardProps {
  product: Product;
  index: number;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, index, viewMode = 'grid' }: ProductCardProps) => {
  const { addToCart, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setJustAdded(true);
    
    // Reset the "just added" state after 2 seconds
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <motion.div
        variants={fadeIn('up', 0.1 * index)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
      >
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <Link href={`/shopping/${product.id}`} className="md:w-1/3">
            <div className="relative h-64 md:h-full overflow-hidden bg-white cursor-pointer flex items-center justify-center p-6">
              <Image
                src={product.image.replace('w=500&h=500', 'w=600&h=600&q=85')}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-500"
                unoptimized
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Out of Stock</span>
                </div>
              )}
            </div>
          </Link>

          {/* Product Info */}
          <div className="md:w-2/3 p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-accent/10 text-accent px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
                </div>
              </div>

              {/* Product Name */}
              <Link href={`/shopping/${product.id}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-accent transition-colors cursor-pointer">
                  {product.name}
                </h3>
              </Link>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {product.description}
              </p>

              {/* Features (if available) */}
              {product.features && product.features.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <p className="text-3xl font-bold text-accent">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Free shipping</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/shopping/${product.id}`}>
                  <button className="px-6 py-3 rounded-xl font-semibold border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300">
                    View Details
                  </button>
                </Link>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    product.inStock
                      ? justAdded
                        ? 'bg-green-500 text-white'
                        : 'bg-accent text-white hover:bg-accent/90 hover:scale-105 shadow-lg shadow-accent/30'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!product.inStock ? (
                    'Unavailable'
                  ) : justAdded ? (
                    <>
                      <FiCheck className="w-5 h-5" />
                      Added!
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View Layout (Original)
  return (
    <motion.div
      variants={fadeIn('up', 0.1 * index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
    >
      {/* Product Image */}
      <Link href={`/shopping/${product.id}`}>
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-white cursor-pointer flex items-center justify-center p-6">
          <Image
            src={product.image.replace('w=500&h=500', 'w=600&h=600&q=85')}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-500"
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
          {product.inStock && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-accent to-rose-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              New
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <p className="text-accent text-sm font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full"></span>
          {product.category}
        </p>

        {/* Product Name */}
        <Link href={`/shopping/${product.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] hover:text-accent transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-gray-600 text-sm ml-2 font-medium">({product.rating})</span>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-accent to-rose-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              product.inStock
                ? justAdded
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : inCart
                  ? 'bg-accent/90 text-white hover:bg-accent hover:scale-105 shadow-lg shadow-accent/30'
                  : 'bg-gradient-to-r from-accent to-rose-600 text-white hover:scale-105 shadow-lg shadow-accent/30'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!product.inStock ? (
              'Unavailable'
            ) : justAdded ? (
              <>
                <FiCheck className="w-4 h-4" />
                Added!
              </>
            ) : inCart ? (
              <>
                <FiShoppingCart className="w-4 h-4" />
                Add More
              </>
            ) : (
              <>
                <FiShoppingCart className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
