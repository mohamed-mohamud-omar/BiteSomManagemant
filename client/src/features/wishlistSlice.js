import { createSlice } from '@reduxjs/toolkit';

const initialItems = (() => {
  try {
    const val = localStorage.getItem('wishlistItems');
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
})();

const initialState = {
  items: initialItems,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload; // { foodId, name, price, image, discountPercentage, restaurantId }
      const exists = state.items.some((i) => i.foodId === item.foodId);
      
      if (!exists) {
        state.items.push(item);
        localStorage.setItem('wishlistItems', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i.foodId !== action.payload);
      localStorage.setItem('wishlistItems', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlistItems');
    }
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
