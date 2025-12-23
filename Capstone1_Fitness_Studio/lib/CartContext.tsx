// 'use client'
// import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {

  productId: string;
  name: string;
  url: string;
  quantity: number;
  price: number;
  totalPrice: number;

}

// interface CartContextType {
//   cartItems: CartItem[];
//   items: CartItem[]; // Alias for compatibility
//   addToCart: (product: any) => void;
//   removeFromCart: (productId: string) => void;
//   updateQuantity: (productId: string, quantity: number) => void;
//   clearCart: () => void;
//   getTotalItems: () => number;
//   getTotalPrice: () => number;
//   isInCart: (productId: string) => boolean;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const CartProvider = ({ children }: { children: React.ReactNode }) => {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [isClient, setIsClient] = useState(false);

//   // Load cart from localStorage on mount
//   useEffect(() => {
//     setIsClient(true);
//     const savedCart = localStorage.getItem('cart');
//     if (savedCart) {
//       try {
//         setCartItems(JSON.parse(savedCart));
//       } catch (error) {
//         console.error('Error loading cart from localStorage:', error);
//       }
//     }
//   }, []);

//   // Save cart to localStorage whenever it changes
//   useEffect(() => {
//     if (isClient) {
//       localStorage.setItem('cart', JSON.stringify(cartItems));
//     }
//   }, [cartItems, isClient]);

//   const addToCart = (product: any) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.id === product.id);

//       if (existingItem) {
//         // Increase quantity if item already exists
//         return prevItems.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       } else {
//         // Add new item to cart
//         return [
//           ...prevItems,
//           {
//             id: product.id,
//             name: product.name,
//             price: product.price,
//             image: product.image,
//             quantity: 1,
//             category: product.category,
//           },
//         ];
//       }
//     });
//   };

//   const removeFromCart = (productId: string) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
//   };

//   const updateQuantity = (productId: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }

//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   const getTotalItems = () => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   };

//   const getTotalPrice = () => {
//     return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
//   };

//   const isInCart = (productId: string) => {
//     return cartItems.some((item) => item.id === productId);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         items: cartItems, // Alias for compatibility
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         getTotalItems,
//         getTotalPrice,
//         isInCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (context === undefined) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

// export default CartContext;

"use client";

import React, { createContext, useContext, useState } from "react";

export type CartContextType = {
  totalItems: number;
  addItem: (qty?: number) => void;
  removeItem: (qty?: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [totalItems, setTotalItems] = useState(0);

  const addItem = (qty: number = 1) => {
    setTotalItems(prev => prev + qty);
  };

  const removeItem = (qty: number = 1) => {
    setTotalItems(prev => Math.max(prev - qty, 0));
  };

  return (
    <CartContext.Provider value={{ totalItems, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
};
export default CartContext;