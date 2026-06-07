import { createSlice } from '@reduxjs/toolkit';

// Parse initial state from localStorage safely
const initialItems = (() => {
  try {
    const val = localStorage.getItem('cartItems');
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
})();

const initialState = {
  items: initialItems,
  coupon: null, // Applied coupon: { code, discountPercentage }
};

const calculateTotals = (state) => {
  let subtotal = 0;
  state.items.forEach((item) => {
    const priceAfterDiscount = item.price * (1 - (item.discountPercentage || 0) / 100);
    subtotal += priceAfterDiscount * item.quantity;
  });

  const tax = subtotal * 0.05; // 5% VAT tax
  const deliveryFee = state.items.length > 0 ? 1.50 : 0.0; // Default delivery fee
  
  let discount = 0;
  if (state.coupon) {
    discount = subtotal * (state.coupon.discountPercentage / 100);
  }

  const total = subtotal + tax + deliveryFee - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.max(0, Math.round(total * 100) / 100)
  };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { foodId, name, price, image, discountPercentage, restaurantId } = action.payload;
      
      // Enforce items are from the same restaurant (MERN standard logic)
      if (state.items.length > 0 && state.items[0].restaurantId !== restaurantId) {
        // Clear previous restaurant items
        state.items = [];
        state.coupon = null;
      }

      const existingItem = state.items.find((item) => item.foodId === foodId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          foodId,
          name,
          price,
          image,
          discountPercentage: discountPercentage || 0,
          quantity: 1,
          restaurantId
        });
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.foodId !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
      if (state.items.length === 0) {
        state.coupon = null;
      }
    },
    updateQuantity: (state, action) => {
      const { foodId, quantity } = action.payload;
      const item = state.items.find((item) => item.foodId === foodId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    applyCouponSuccess: (state, action) => {
      state.coupon = action.payload; // { code, discountPercentage }
    },
    removeCoupon: (state) => {
      state.coupon = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      localStorage.removeItem('cartItems');
    }
  }
});

export const selectCartTotals = (state) => calculateTotals(state.cart);

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCouponSuccess,
  removeCoupon,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
