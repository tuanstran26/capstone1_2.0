'use client'
import { motion } from 'framer-motion';
import ProductCard, { Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const ProductGrid = ({ products, viewMode = 'grid' }: ProductGridProps) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {products.map((product, index) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} index={index} viewMode="list" priority={index < 4} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} index={index} viewMode="grid" priority={index < 8} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
