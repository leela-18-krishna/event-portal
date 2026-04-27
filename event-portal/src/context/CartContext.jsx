import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (event) => {
    if (!cart.find(e => e._id === event._id)) {
      setCart([...cart, event]);
      alert(`Added ${event.title} to cart!`);
    } else {
      alert(`${event.title} is already in the cart.`);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
