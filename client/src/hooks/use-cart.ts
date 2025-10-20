import { useState, useEffect } from 'react';
import { Product } from '@shared/schema';
import { cartUtils, Cart } from '@/lib/cart';

const CART_CHANGE_EVENT = 'cart:changed';

export function useCart() {
  const [cart, setCart] = useState<Cart>(() => cartUtils.getCart());

  useEffect(() => {
    const handleStorageChange = () => {
      setCart(cartUtils.getCart());
    };

    const handleCartChange = () => {
      setCart(cartUtils.getCart());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CART_CHANGE_EVENT, handleCartChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
    };
  }, []);

  const addItem = (product: Product, quantity: number = 1) => {
    const newCart = cartUtils.addItem(product, quantity);
    setCart(newCart);
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  };

  const removeItem = (productId: string) => {
    const newCart = cartUtils.removeItem(productId);
    setCart(newCart);
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const newCart = cartUtils.updateQuantity(productId, quantity);
    setCart(newCart);
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  };

  const clearCart = () => {
    const newCart = cartUtils.clearCart();
    setCart(newCart);
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    items: cart.items,
    total: cart.total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
