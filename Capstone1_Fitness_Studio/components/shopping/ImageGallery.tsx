'use client'
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZoomIn, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

const ImageGallery = ({ images, productName }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Safety check
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isZoomed) return;
    if (e.key === 'Escape') setIsZoomed(false);
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Add keyboard listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown as any);
  }

  // Debug logging
  console.log('ImageGallery images:', images);
  console.log('Selected image index:', selectedImage);
  console.log('Current image URL:', images[selectedImage]);

  return (
    <>
      <div className="space-y-4">
        {/* Main Image Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full rounded-2xl overflow-hidden bg-white group border-2 border-gray-300 shadow-2xl"
          style={{ paddingBottom: '100%' }}
        >
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[selectedImage].replace('w=800&h=800', 'w=1200&h=1200&q=90')}
              alt={`${productName} - Image ${selectedImage + 1}`}
              className="w-full h-full object-contain"
              loading="eager"
            />
          </motion.div>
          
          {/* Zoom Button */}
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <FiZoomIn className="w-5 h-5 text-gray-700" />
          </button>

          {/* Navigation Arrows for Main Image */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
            {selectedImage + 1} / {images.length}
          </div>
        </motion.div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-lg overflow-hidden border-3 transition-all duration-300 bg-white ${
                  selectedImage === index
                    ? 'border-accent shadow-xl ring-4 ring-accent/30 ring-offset-2 scale-105'
                    : 'border-gray-300 hover:border-accent/50 opacity-70 hover:opacity-100'
                }`}
                style={{ paddingBottom: '100%' }}
              >
                <div className="absolute inset-0 p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.replace('w=800&h=800', 'w=400&h=400&q=85')}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      selectedImage === index ? 'brightness-100' : 'brightness-90'
                    }`}
                  />
                </div>
                {selectedImage === index && (
                  <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-10"
            >
              <FiX className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors z-10"
                >
                  <FiChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors z-10"
                >
                  <FiChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 text-white px-6 py-3 rounded-full text-lg font-medium z-10">
              {selectedImage + 1} / {images.length}
            </div>

            {/* Zoomed Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImage].replace('w=800&h=800', 'w=1600&h=1600&q=95')}
                alt={`${productName} - Zoomed ${selectedImage + 1}`}
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            </motion.div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 p-4 bg-white/10 rounded-full backdrop-blur-sm z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedImage === index
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
