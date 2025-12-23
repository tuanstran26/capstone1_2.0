'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCheck, FiArrowLeft, FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi';
import { useCart } from '@/lib/CartContext';
import ImageGallery from '@/components/shopping/ImageGallery';
import { Product } from '@/components/shopping/ProductCard';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { totalItems, addItem, removeItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'specifications'>('description');

  // useEffect(() => {
  //   const foundProduct = sportsProducts.find((p: Product) => p._id === params.id);
  //   if (foundProduct) {
  //     console.log('Found product:', foundProduct.name);
  //     console.log('Product images:', foundProduct.images);
  //     console.log('Product image (fallback):', foundProduct.images[0]);
  //     setProduct(foundProduct);
  //   } else {
  //     router.push('/shopping');
  //   }
  // }, [params.id, router]);


  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:5000/product/get-product/${id}`);

        if (!res.ok) {
          console.error("Failed to fetch product");
          return;
        }

        const data = await res.json();
        console.log("Fetched product:", data);

        setProduct(data);
      } catch (error) {
        console.error("Fetch product error:", error);
      }
    }

    fetchProduct();
  }, [params.id])


  // const handleAddToCart = () => {
  //   if (!product) return;
  //   for (let i = 0; i < quantity; i++) {
  //     addToCart(product);
  //   }
  //   setJustAdded(true);
  //   setTimeout(() => setJustAdded(false), 2000);
  // };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = async () => {
    console.log('Adding to cart:', product, 'Quantity:', quantity);
    if (!product) return;
    const storedData = localStorage.getItem('user');
    if (!storedData) {
      alert('Please log in to add items to your cart.');
      return;
    }
    const userData = JSON.parse(storedData);
    console.log("product._id:", product._id);
    const cartId = userData?.cartId;
    const res = await fetch(`http://localhost:5000/cart/add/${cartId}`, {
      method: 'POST',
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: product._id,
        name: product.name,
        url: product.images[0].url || '',
        price: product.price,
        quantity: quantity,
      }),
    });
    if (res.ok) {
      console.log('Added to cart successfully');
      addItem(quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 5000);

    } else {
      console.error('Failed to add to cart');
      alert('Failed to add to cart. Please try again.');
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const images = product.images?.map((img: any) => img.url) || [];
  console.log('Images to display:', images);
  // const inCart = isInCart(product._id);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link href="/shopping">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-gray-600 hover:text-accent mb-8 font-medium transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Shopping
          </motion.button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ImageGallery images={images} productName={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                {product.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${i < product.rating.avg
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({product.rating.avg}.0)</span>
              {!product.inStock && (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            <div className="py-4 border-y border-gray-200">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-accent">
                  {product.price} VND
                </span>
                <span className="text-gray-500 line-through text-xl">
                  {(product.price * 1.3)}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  Save 23%
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {product.description}
            </p>

            {product.inStock && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Quantity:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-xl"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 border-x-2 border-gray-300 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${product.inStock
                  ? justAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-accent text-white hover:bg-accent-hover hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {!product.inStock ? (
                  'Out of Stock'
                ) : justAdded ? (
                  <>
                    <FiCheck className="w-6 h-6" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-6 h-6" />
                    {/* {inCart ? `Add ${quantity} More to Cart` : 'Add to Cart'} */}
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiTruck className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                <span className="text-xs text-gray-500">Orders over $100</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Secure Payment</span>
                <span className="text-xs text-gray-500">100% Protected</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <FiRefreshCw className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">30-Day Returns</span>
                <span className="text-xs text-gray-500">Money Back</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {(['description', 'features', 'specifications'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-lg font-semibold capitalize transition-all ${activeTab === tab
                  ? 'text-accent border-b-4 border-accent'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  This premium {product.name.toLowerCase()} is designed for serious fitness enthusiasts
                  who demand quality and performance. Whether you're setting up a home gym or upgrading
                  your existing equipment, this product delivers exceptional value and durability.
                </p>
              </motion.div>
            )}




          </div>
        </motion.div>
      </div>
    </div>
  );
}

// 'use client';
// export default function ProductDetailTest({ params }: { params: { id: string } }) {
//   return (
//     <div className="p-10 text-3xl font-bold">
//       Product Detail Page
//       <br />
//       <span className="text-blue-600">ID: {params.id}</span>
//     </div>
//   );
// }
