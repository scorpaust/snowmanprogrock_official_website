import { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

const CART_STORAGE_KEY = "snowman_cart";

export const cartUtils = {
  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], total: 0 };
    }
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) {
        return { items: [], total: 0 };
      }
      
      const cart: Cart = JSON.parse(stored);
      return cart;
    } catch (error) {
      console.error('Error loading cart:', error);
      return { items: [], total: 0 };
    }
  },

  saveCart(cart: Cart): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  addItem(product: Product, quantity: number = 1): Cart {
    const cart = this.getCart();
    const existingIndex = cart.items.findIndex(
      item => item.product.id === product.id
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product, quantity });
    }

    cart.total = this.calculateTotal(cart.items);
    this.saveCart(cart);
    return cart;
  },

  removeItem(productId: string): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.product.id !== productId);
    cart.total = this.calculateTotal(cart.items);
    this.saveCart(cart);
    return cart;
  },

  updateQuantity(productId: string, quantity: number): Cart {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(
      item => item.product.id === productId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    cart.total = this.calculateTotal(cart.items);
    this.saveCart(cart);
    return cart;
  },

  clearCart(): Cart {
    const cart = { items: [], total: 0 };
    this.saveCart(cart);
    return cart;
  },

  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  },

  getItemCount(): number {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
};
