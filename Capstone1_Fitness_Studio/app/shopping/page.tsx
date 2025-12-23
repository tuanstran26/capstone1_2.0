'use client'
import { useState, useMemo, useEffect } from 'react';
import ProductGrid from '@/components/shopping/ProductGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn } from '@/lib/variants';
import { FiGrid, FiList, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const categories = ['All', 'Clothing', 'Footwear', 'Accessories', 'Equipment'];
const ITEMS_PER_PAGE = 8;

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name-az' | 'rating';

export default function ShoppingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/product/get-product", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const result = await res.json();
        console.log("Full API response:", result);

        // Adjust based on what you see in console
        const productsArray = result.data || result.products || result;

        if (!Array.isArray(productsArray)) {
          console.error("Expected array, got:", productsArray);
          setError("Invalid data format from server");
          setLoading(false);
          return;
        }

        setProducts(productsArray);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort(
          (a, b) => (b.rating?.avg || 0) - (a.rating?.avg || 0)
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);


  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading products...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500 font-semibold">
        Failed to load products: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          variants={fadeIn('down', 0.2)}
          initial="hidden"
          animate="show"
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="bg-accent/10 text-accent px-6 py-2 rounded-full text-sm font-semibold">
              ⚡ Premium Quality Products
            </span>
          </motion.div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-accent via-rose-600 to-accent bg-clip-text text-transparent">
            Sports & Fitness Shop
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover premium sports clothing, footwear, accessories, and fitness equipment.
            <br />Everything you need for your active lifestyle.
          </p>
        </motion.div>

        {/* Search Bar with Enhanced Design */}
        <motion.div
          variants={fadeIn('up', 0.3)}
          initial="hidden"
          animate="show"
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="relative group">
            <input
              type="text"
              placeholder="Search products, categories, brands..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-6 py-5 pl-14 rounded-2xl border-2 border-gray-200 focus:border-accent focus:outline-none text-gray-700 placeholder-gray-400 shadow-lg transition-all duration-300 group-hover:shadow-xl"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-accent transition-colors"
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
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter with Icons */}
        <motion.div
          variants={fadeIn('up', 0.4)}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filter by Category</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md ${selectedCategory === category
                  ? 'bg-gradient-to-r from-accent to-rose-600 text-white shadow-lg shadow-accent/50'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
                  }`}
              >
                {category}
                {selectedCategory === category && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 inline-block w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Toolbar - Sort, View Mode, Results */}
        <motion.div
          variants={fadeIn('up', 0.5)}
          initial="hidden"
          animate="show"
          className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Results Count */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                Showing <span className="font-bold text-accent">{currentProducts.length}</span> of{' '}
                <span className="font-bold">{filteredAndSortedProducts.length}</span> products
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-accent shadow-md' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Grid View"
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-accent shadow-md' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="List View"
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <AnimatePresence mode="wait">
          {currentProducts.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${currentPage}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductGrid products={currentProducts} viewMode={viewMode} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
              <div className="mb-6">
                <svg
                  className="w-32 h-32 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-700 mb-3">No products found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent/90 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            variants={fadeIn('up', 0.6)}
            initial="hidden"
            animate="show"
            className="mt-12 flex justify-center items-center gap-2"
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-3 rounded-lg transition-all ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-accent hover:text-white shadow-md hover:shadow-lg'
                }`}
            >
              <FiChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-lg font-semibold transition-all ${currentPage === page
                    ? 'bg-gradient-to-r from-accent to-rose-600 text-white shadow-lg shadow-accent/50'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                    }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-lg transition-all ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-accent hover:text-white shadow-md hover:shadow-lg'
                }`}
            >
              <FiChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <motion.div
            variants={fadeIn('up', 0.7)}
            initial="hidden"
            animate="show"
            className="mt-6 text-center text-gray-500 text-sm"
          >
            Page {currentPage} of {totalPages}
          </motion.div>
        )}
      </div>
    </div>
  );
}
