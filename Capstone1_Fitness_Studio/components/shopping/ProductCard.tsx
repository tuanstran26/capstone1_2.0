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
}

const ProductCard = ({ product, index }: ProductCardProps) => {
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

  return (
    <motion.div
      variants={fadeIn('up', 0.1 * index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Product Image */}
      <Link href={`/shopping/${product.id}`}>
        <div className="relative h-64 overflow-hidden bg-white cursor-pointer flex items-center justify-center p-4">
          <Image
            src={product.image.replace('w=500&h=500', 'w=600&h=600&q=85')}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-500"
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
          {product.inStock && (
            <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
              New
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <p className="text-accent text-sm font-medium uppercase tracking-wide mb-2">
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
              className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-accent">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
              product.inStock
                ? justAdded
                  ? 'bg-green-500 text-white'
                  : inCart
                  ? 'bg-accent/80 text-white hover:bg-accent hover:scale-105'
                  : 'bg-accent text-white hover:bg-accent-hover hover:scale-105'
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
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
